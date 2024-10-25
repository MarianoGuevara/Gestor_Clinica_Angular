import { Usuario } from "./usuario";

export class Administrador extends Usuario{
    constructor(
        nombre: string,
        apellido: string,
        edad: number,
        dni: number,
        mail: string,
        password: string,
        imagenPerfil: string,
        rol: string
    ) {
        super( nombre,apellido,edad,dni,mail,password, imagenPerfil, rol)
    }
}
