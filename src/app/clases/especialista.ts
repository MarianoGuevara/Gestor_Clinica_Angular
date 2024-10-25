import { Usuario } from "./usuario";

export class Especialista extends Usuario{
    especialidad:string[];

    constructor(
        nombre: string,
        apellido: string,
        edad: number,
        dni: number,
        mail: string,
        password: string,
        imagenPerfil: string,
        rol:string,
        verificado: boolean,
        especialidad: string[],
    ) {
        super( nombre,apellido,edad,dni,mail,password, imagenPerfil, rol, verificado)
        this.especialidad = especialidad;
    }
}
