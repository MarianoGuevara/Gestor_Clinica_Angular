export class Usuario {
    nombre: string;
    apellido: string;
    edad: number;
    dni: number;
    mail: string;
    password: string;
    imagenPerfil: string;
    rol: string;
    verificado: boolean;

    constructor(
        nombre: string,
        apellido: string,
        edad: number,
        dni: number,
        mail: string,
        password: string,
        imagenPerfil: string,
        rol: string,
        verificado: boolean
    ) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.dni = dni;
        this.mail = mail;
        this.password = password;
        this.imagenPerfil = imagenPerfil;
        this.rol = rol;
        this.verificado = verificado;
    }
}
