// interfaces.ts
export interface IUsuario {
    nombre: string;
    apellido: string;
    edad: number;
    dni: number;
    mail: string;
    password: string;
    imagenPerfil: string;
    rol: string;
    verificado: boolean;
    id: string;
}

export interface IPaciente extends IUsuario {
    obraSocial: string;
    imagenPerfil2: string;
}

export interface IEspecialista extends IUsuario {
    especialidad: string[];
}

export interface IAdministrador extends IUsuario {
    // Si tiene alguna propiedad única, se puede agregar aquí
}
