import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';

const PDFWindow = require('electron-pdf-window');
import * as path from 'path';
import * as fs from 'fs';
const loki = require('lokijs');
const { execFile } = require('child_process');

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

// We will use autoload (one time load at instantiation), and autosave  with 4 sec interval.
const db = new loki('pacientes.json', {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000, // save every four seconds for our example
});

function databaseInitialize() {
  const pacientes = db.getCollection('pacientes');
  if (pacientes === null) {
    db.addCollection('pacientes', { unique: 'nif' });
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
ipcMain.on('scan:new', (e, newProduct) => {
  const pacientes = db.getCollection('pacientes');
  let doc = pacientes.by('nif', newProduct.nif); //select the doc first to be updated
  // console.log(doc);
  const nombreFichero = `${newProduct.nif}-${Math.floor(
    10000 + Math.random() * 90000
  )}`;
  // const nombreFichero = `${newProduct.nombre}-${newProduct.nif}-${
  //   doc ? doc.pdfs.length + 1 : 1
  // }`;
  // scanAndSavePDF(
  //   doc && doc.pdfs && doc.pdfs.length < 1 ? false : true, //create folder
  //   doc ? doc.nombre : newProduct.nombre,
  //   nombreFichero
  // );
  const createFoler = doc && doc.pdfs && doc.pdfs.length < 1 ? false : true;
  const folder = doc ? doc.nombre : newProduct.nombre;

  if (createFoler) {
    fs.mkdir(`./pacientes/${folder}`, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }
  execFile(
    'C:/Program Files/NAPS2/NAPS2.Console.exe',
    ['-o', `./pacientes/${folder}/${nombreFichero}.pdf`],
    (error, stdout, stderr) => {
      if (error) {
        e.reply('scan:reply', error);

        throw error;
      }
      const result = pacientes.by('nif', newProduct.nif);
      e.reply('scan:reply', result);
      console.log(stdout);
    }
  );

  if (doc) {
    doc.pdfs.push({
      descripcion: `./pacientes/${newProduct.nombre}/${nombreFichero}.pdf`,
      fecha: new Date(),
    }); //update its values
    pacientes.update(doc); //update the collection
  } else {
    newProduct.pdfs.push({
      descripcion: `./pacientes/${newProduct.nombre}/${nombreFichero}.pdf`,
      fecha: new Date(),
    }); //update its values
    pacientes.insert(newProduct);
  }
});

// Nuevo paciente
ipcMain.on('product:new', (e, newProduct) => {
  if (!newProduct.nif || !newProduct.nombre) {
    dialog.showErrorBox(
      'Error',
      `Los campos 'Nombre' y 'NIF' son obligatorios`
    );
    e.reply('new:reply', { error: 1 });
    return;
  }
  const pacientes = db.getCollection('pacientes');
  let doc = pacientes.by('nif', newProduct.nif);
  if (doc) {
    dialog.showErrorBox(
      'Error',
      `El usuario con NIF: ${newProduct.nif} ya existe`
    );
    e.reply('new:reply', { error: 2 });
  } else {
    pacientes.insert(newProduct);
    e.reply('new:reply', doc);
  }
});

function updateAlPdfsUrl(pdfs, oldname, newname) {
  for (var i in pdfs) {
    pdfs[i].descripcion = pdfs[i].descripcion.replace(oldname, newname);
  }
  return pdfs;
}

// Listar pacientes
ipcMain.on('product:list', (e, p) => {
  const pacientes = db.getCollection('pacientes');
  const result = pacientes.find({});
  e.reply('list:reply', result);
});

// ediar paciente
ipcMain.on('product:update', (e, newProduct) => {
  const pacientes = db.getCollection('pacientes');
  let doc = pacientes.by('nif', newProduct.nif);
  // console.log(doc, newProduct);
  if (doc && doc.pdfs && doc.pdfs.length > 0) {
    fs.renameSync(
      './pacientes/' + doc.nombre,
      './pacientes/' + newProduct.nombre
    );
    doc.pdfs = updateAlPdfsUrl(doc.pdfs, doc.nombre, newProduct.nombre);
  }
  doc.nombre = newProduct.nombre;
  doc.direccion = newProduct.direccion;
  doc.telefono = newProduct.telefono;
  doc.movil = newProduct.movil;
  doc.area = newProduct.area;
  pacientes.update(doc);
  e.reply('update:reply', doc);
});

// borrar pacientes
ipcMain.on('product:remove', (e, data) => {
  dialog
    .showMessageBox(win, {
      type: 'question',
      title: 'Confirmación',
      message: '¿Quieres borrar el paciente: ' + data.nif + ' ?',
      buttons: ['Si', 'No '],
    })
    // Dialog returns a promise so let's handle it correctly
    .then((result) => {
      let pacientes = db.getCollection('pacientes');
      if (result.response !== 0) {
        // const resultF = pacientes.find({});
        // e.reply('remove:reply', resultF);
        return;
      }

      // Testing.
      if (result.response === 0) {
        const paciente = pacientes.find(data);
        if (paciente.length > 0) {
          pacientes.chain().find(data).remove();
        }
        // pacientes = pacientes.filter(function (obj) {
        //   return obj.nif !== data.nif;
        // });
        const resultF = pacientes.find({});
        e.reply('remove:reply', resultF);
      }
    });
});

// borrar fichero de paciente
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
        const pacientes = db.getCollection('pacientes');
        let doc = pacientes.by('nif', request.nif);
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
            'Este fichero no existe en la carpeta del paciente'
          );
        }
      }
    });
});

// ver fichero de paciente
ipcMain.on('file:view', (e, request) => {
  // const pacientes = db.getCollection('pacientes');
  // let doc = pacientes.by('nif', request.nif);
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
