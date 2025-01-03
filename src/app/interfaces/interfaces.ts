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

export interface IAdministrador extends IUsuario {}

/////////////////////////////////////////////

export interface ITurno {
	id: string;
	especialidad: string;
	especialistaId: string;
	especialistaNombreApellido: string;
	fecha: string;
	horario: string;
	pacienteId: string;
	pacienteNombreApellido: string;
	estado: string;
	rechazado_especialista: string;
	cancelado_especialista: string;
	cancelado_paciente: string;
	cancelado_administrador: string;
	completado_especialista: string; 
	completado_paciente_encuesta: string;
	completado_paciente_atencion: string;  
}

export interface IHorariosEspecialista {
	id: string;
	idEspecialista: string;
	lunes: string[];
	martes: string[];
	miercoles: string[];
	jueves: string[];
	viernes: string[];
	sabado: string[];
}

export interface IHistoriaClinica {
	id: string;
	idPaciente: string;
	idEspecialista: string;
	idTurno: string;
	altura: number;
	peso: number;
	temperatura: number;
	presion: number;
	dinamico1?: string;
	dinamico2?: string;
	dinamico3?: string;
}


export interface IEspecialidad {
	id: string;
	nombre: string;
	foto: string;
}

export interface ILog {
	id: string,
	fecha: string,
	horario: string,
	id_user: string,
	nombre_user: string,
}