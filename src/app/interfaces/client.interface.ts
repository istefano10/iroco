export interface Client {
  id:number
  ref:string,
  nombre: string;
  apellidos:string;
  fechaNac: Date,
  codPostal:string,
  ciudad:string,
  nif: string;
  pasaporte:string,
  Direccion: string;
  telefono: string;
  email: string;
  Firma?: string;
}
