import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';

const PDFWindow = require('electron-pdf-window');
import * as path from 'path';
const os = require('os');
const desktopDir = path.join(os.homedir(), 'Desktop');

import * as fs from 'fs';
const loki = require('lokijs');
const { execFile } = require('child_process');

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

// We will use autoload (one time load at instantiation), and autosave  with 4 sec interval.
const db = new loki('iroco.json', {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000, // save every four seconds for our example
});

function databaseInitialize() {
  const clientes = db.getCollection('clientes');
  if (clientes === null) {
    db.addCollection('clientes', { unique: 'nif' });
  }
  const expedientes = db.getCollection('expedientes');
  if (expedientes === null) {
    db.addCollection('expedientes', { unique: 'ref' });
  }
  const presupuestos = db.getCollection('presupuestos');
  if (presupuestos === null) {
    db.addCollection('presupuestos', { unique: 'ref' });
  }
}

function createWindow(): BrowserWindow {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,
    },
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }
  // Open the DevTools.
  win.webContents.openDevTools();
  win.maximize();
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

// Escanear
ipcMain.on('scan:new', (e, newClient) => {
  const clientes = db.getCollection('clientes');
  let doc = clientes.by('nif', newClient.nif); //select the doc first to be updated
  // console.log(doc);
  const nombreFichero = `${newClient.nif}-${Math.floor(
    10000 + Math.random() * 90000
  )}`;
  // const nombreFichero = `${newClient.nombre}-${newClient.nif}-${
  //   doc ? doc.pdfs.length + 1 : 1
  // }`;
  // scanAndSavePDF(
  //   doc && doc.pdfs && doc.pdfs.length < 1 ? false : true, //create folder
  //   doc ? doc.nombre : newClient.nombre,
  //   nombreFichero
  // );
  const createFoler = doc && doc.pdfs && doc.pdfs.length < 1 ? false : true;
  const folder = doc ? doc.nombre : newClient.nombre;

  if (createFoler) {
    fs.mkdir(`./clientes/${folder}`, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }
  execFile(
    'C:/Program Files/NAPS2/NAPS2.Console.exe',
    ['-o', `./clientes/${folder}/${nombreFichero}.pdf`],
    (error, stdout, stderr) => {
      if (error) {
        e.reply('scan:reply', error);

        throw error;
      }
      const result = clientes.by('nif', newClient.nif);
      e.reply('scan:reply', result);
      console.log(stdout);
    }
  );

  if (doc) {
    doc.pdfs.push({
      descripcion: `./clientes/${newClient.nombre}/${nombreFichero}.pdf`,
      fecha: new Date(),
    }); //update its values
    clientes.update(doc); //update the collection
  } else {
    newClient.pdfs.push({
      descripcion: `./clientes/${newClient.nombre}/${nombreFichero}.pdf`,
      fecha: new Date(),
    }); //update its values
    clientes.insert(newClient);
  }
});

// Nuevo expediente
ipcMain.on('expediente:new', (e, newExpediente) => {

  if (!newExpediente.ref) {
    dialog.showErrorBox(
      'Error',
      `Los campos 'Id de referencia' y 'NIF' son obligatorios`
    );
    e.reply('newExpediente:reply', { error: 1 });
    return;
  }
  const expedientes = db.getCollection('expedientes');
  let doc = expedientes.by('ref', newExpediente.ref);
  if (doc) {
    dialog.showErrorBox(
      'Error',
      `El expediente con referencia: ${newExpediente.ref} ya existe`
    );
    e.reply('newExpediente:reply', { error: 2 });
  } else {
    expedientes.insert(newExpediente);
    const folderNames = [
      'Reserva de hoteles',
      'Notas',
      'Información general operativa',
    ];
    folderNames.forEach((folder) => {
      fs.mkdir(
        desktopDir + `\\Expedientes\\${newExpediente.ref}\\${folder}`,
        { recursive: true },
        (err) => {
          if (err) throw err;
        }
      );
    });
    e.reply('newExpediente:reply', doc);
  }
});

// Listar expedientes
ipcMain.on('expedientes:list', (e, p) => {
  const expedientes = db.getCollection('expedientes');
  const result = expedientes.find({});
  e.reply('expedientes:listreply', result);
});

// ediar expediente
ipcMain.on('expediente:update', (e, newExpediente) => {
  const expedientes = db.getCollection('expedientes');
  let doc = expedientes.by('ref', newExpediente.ref);
  // console.log(doc, newClient);
  // if (doc && doc.pdfs && doc.pdfs.length > 0) {
  //   fs.renameSync(
  //     './clientes/' + doc.nombre,
  //     './clientes/' + newClient.nombre
  //   );
  //   doc.pdfs = updateAlPdfsUrl(doc.pdfs, doc.nombre, newClient.nombre);
  // }

  doc.ref = newExpediente.ref;
  doc.idGrupo = newExpediente.idGrupo;

  expedientes.update(doc);
  e.reply('expediente:updatereply', doc);
});

// borrar expediente
ipcMain.on('expediente:remove', (e, data) => {
  dialog
    .showMessageBox(win, {
      type: 'question',
      title: 'Confirmación',
      message: '¿Quieres borrar el expediente: ' + data.ref + ' ?',
      buttons: ['Si', 'No '],
    })
    // Dialog returns a promise so let's handle it correctly
    .then((result) => {
      let expedientes = db.getCollection('expedientes');
      if (result.response !== 0) {
        return;
      }

      // Testing.
      if (result.response === 0) {
        const cliente = expedientes.find(data);
        if (cliente.length > 0) {
          expedientes.chain().find(data).remove();
        }
        const resultF = expedientes.find({});
        e.reply('expediente:removereply', resultF);
      }
    });
});

// Nuevo cliente
ipcMain.on('cliente:new', (e, newClient) => {

  if (!newClient.nif || !newClient.nombre) {
    dialog.showErrorBox(
      'Error',
      `Los campos 'Nombre' y 'NIF' son obligatorios`
    );
    e.reply('newCliente:reply', { error: 1 });
    return;
  }
  const clientes = db.getCollection('clientes');
  let doc = clientes.by('nif', newClient.nif);
  if (doc) {
    dialog.showErrorBox(
      'Error',
      `El usuario con NIF: ${newClient.nif} ya existe`
    );
    e.reply('newCliente:reply', { error: 2 });
  } else {
    clientes.insert(newClient);
    e.reply('newCliente:reply', doc);
  }
});

// Listar clientes
ipcMain.on('clientes:list', (e, p) => {
  const clientes = db.getCollection('clientes');
  const result = clientes.find({});
  e.reply('clientes:listreply', result);
});

// ediar cliente
ipcMain.on('cliente:update', (e, newClient) => {
  const clientes = db.getCollection('clientes');
  let doc = clientes.by('nif', newClient.nif);
  // console.log(doc, newClient);
  // if (doc && doc.pdfs && doc.pdfs.length > 0) {
  //   fs.renameSync(
  //     './clientes/' + doc.nombre,
  //     './clientes/' + newClient.nombre
  //   );
  //   doc.pdfs = updateAlPdfsUrl(doc.pdfs, doc.nombre, newClient.nombre);
  // }

  doc.nif = newClient.nif;
  doc.nombre = newClient.nombre;
  doc.apellidos = newClient.apellidos;
  doc.fechaNac = newClient.fechaNac;
  doc.pasaporte = newClient.pasaporte;
  doc.direccion = newClient.direccion;
  doc.email = newClient.email;
  doc.telefono = newClient.telefono;
  doc.firma = newClient.firma;
  doc.ciudad = newClient.ciudad;
  doc.codPostal = newClient.codPostal;

  clientes.update(doc);
  e.reply('cliente:updatereply', doc);
});

// borrar clientes
ipcMain.on('cliente:remove', (e, data) => {
  console.log(data)
  dialog
    .showMessageBox(win, {
      type: 'question',
      title: 'Confirmación',
      message: '¿Quieres borrar el cliente: ' + data.nif + ' ?',
      buttons: ['Si', 'No '],
    })
    // Dialog returns a promise so let's handle it correctly
    .then((result) => {
      let clientes = db.getCollection('clientes');
      if (result.response !== 0) {
        return;
      }
      // Testing.
      if (result.response === 0) {
        const cliente = clientes.find(data);
        if (cliente.length > 0) {
          clientes.chain().find(data).remove();
        }
        const resultF = clientes.find({});
        e.reply('cliente:removereply', resultF);
      }
    });
});

// borrar fichero de cliente
ipcMain.on('file:remove', (e, request) => {
  const filename = request.descripcion.replace(/^.*[\\/]/, '');
  dialog
    .showMessageBox(win, {
      type: 'question',
      title: 'Confirmación',
      message: '¿Quieres borrar el fichero: ' + filename + ' ?',
      buttons: ['Si', 'No '],
    })
    // Dialog returns a promise so let's handle it correctly
    .then((result) => {
      // Bail if the user pressed "No" or escaped (ESC) from the dialog box
      if (result.response !== 0) {
        return;
      }

      // Testing.
      if (result.response === 0) {
        const clientes = db.getCollection('clientes');
        let doc = clientes.by('nif', request.nif);
        doc.pdfs = doc.pdfs.filter(function (obj) {
          return obj.descripcion !== request.descripcion;
        });
        e.reply('fileremove:reply', doc);
        if (fs.existsSync(request.descripcion)) {
          fs.unlink(request.descripcion, (err) => {
            if (err) {
              console.log(err);
              dialog.showErrorBox(
                'Error',
                'Ha ocurrido un eror actualizando el fichero ' + err.message
              );
              return;
            }
            console.log('File succesfully deleted');
          });
        } else {
          dialog.showErrorBox(
            'Error',
            'Este fichero no existe en la carpeta del cliente'
          );
        }
      }
    });
});

// Nuevo presupuesto
ipcMain.on('presupuesto:new', (e, newPresupuesto) => {

  if (!newPresupuesto.ref) {
    dialog.showErrorBox(
      'Error',
      `Los campos 'Referencia' es obligatorio`
    );
    e.reply('newPresupuesto:reply', { error: 1 });
    return;
  }
  const presupuestos = db.getCollection('presupuestos');
  let doc = presupuestos.by('ref', newPresupuesto.ref);
  if (doc) {
    dialog.showErrorBox(
      'Error',
      `El presupuesto con referencia: ${newPresupuesto.ref} ya existe`
    );
    e.reply('newPresupuesto:reply', { error: 2 });
  } else {
    presupuestos.insert(newPresupuesto);

    //   fs.mkdir(
    //     desktopDir + `\\Presupuestos`,
    //     { recursive: true },
    //     (err) => {
    //       if (err) throw err;
    //     }
    //   );
    e.reply('newPresupuesto:reply', doc);
  }
});

// Listar presupuestos
ipcMain.on('presupuestos:list', (e, p) => {
  const presupuestos = db.getCollection('presupuestos');
  const result = presupuestos.find({});
  e.reply('presupuestos:listreply', result);
});

// ediar presupuesto
ipcMain.on('presupuesto:update', (e, newPresupuesto) => {
  const presupuestos = db.getCollection('presupuestos');
  let doc = presupuestos.by('ref', newPresupuesto.ref);

  doc.ref = newPresupuesto.ref;

  presupuestos.update(doc);
  e.reply('presupuesto:updatereply', doc);
});

// borrar presupuesto
ipcMain.on('presupuesto:remove', (e, data) => {
  dialog
    .showMessageBox(win, {
      type: 'question',
      title: 'Confirmación',
      message: '¿Quieres borrar el presupuesto: ' + data.ref + ' ?',
      buttons: ['Si', 'No '],
    })
    // Dialog returns a promise so let's handle it correctly
    .then((result) => {
      let presupuestos = db.getCollection('presupuestos');
      if (result.response !== 0) {
        return;
      }

      // Testing.
      if (result.response === 0) {
        const cliente = presupuestos.find(data);
        if (cliente.length > 0) {
          presupuestos.chain().find(data).remove();
        }
        const resultF = presupuestos.find({});
        e.reply('presupuesto:removereply', resultF);
      }
    });
});

// ver fichero de cliente
ipcMain.on('file:view', (e, request) => {
  // const clientes = db.getCollection('clientes');
  // let doc = clientes.by('nif', request.nif);
  // console.log('asda', doc)
  // console.log(
  //   'Current directory:',
  //   __dirname + '\\.' + request.descripcion.replaceAll('/', '\\')
  // );
  const win = new BrowserWindow({ width: 800, height: 600 });
  PDFWindow.addSupport(win);
  win.loadURL(__dirname + '\\.' + request.descripcion.replaceAll('/', '\\'));
  // e.reply('fileview:reply', 'viendo');
});

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Disable menu
  // Menu.setApplicationMenu(null)

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
