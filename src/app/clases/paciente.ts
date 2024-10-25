import { Usuario } from "./usuario";

export class Paciente extends Usuario{
    obraSocial:string;
    imagenPerfil2:string;
    constructor(
        nombre: string,
        apellido: string,
        edad: number,
        dni: number,
        mail: string,
        password: string,
        imagenPerfil: string,
        rol: string,
        verificado: boolean,
        obraSocial: string,
        imagenPerfil2: string
    ) {
        super( nombre,apellido,edad,dni,mail,password, imagenPerfil, rol, verificado)
        this.obraSocial = obraSocial;
        this.imagenPerfil2 = imagenPerfil2;
    }
}
