import { Injectable } from '@angular/core';

// import * as Loki from 'lokijs';

@Injectable({
  providedIn: 'root',
})
export class DBService {
  // db: Loki;
  constructor() {
    // // Conditional imports
    // this.db = new Loki('test', { persistenceMethod: 'fs' });
    // // console.log(db);
    // let pacientes = this.db.getCollection('pacientes');
    // if (pacientes === null) {
    //   pacientes = this.db.addCollection('pacientes');
    // }
    // pacientes.insert({ test: 'test', e: 0 });
    // const result = pacientes.find({});
    // console.log('eeeeeeeeeeeeeee', result);
  }

  // get getDataBase(): Loki {
  //   // Conditional imports
  //   const db = new Loki('test', {
  //     autoload: true,
  //     // autoloadCallback: databaseInitialize,
  //     autosave: true,
  //     autosaveInterval: 4000, // save every four seconds for our example
  //     persistenceMethod: 'fs'
  //   });
  //   // console.log(db);
  //   let pacientes = db.getCollection('pacientes');
  //   if (pacientes === null) {
  //     pacientes = db.addCollection('pacientes');
  //   }

  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //   return db;
  // }


}
