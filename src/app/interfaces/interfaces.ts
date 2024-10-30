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
	fecha: string;
	horario: string;
	pacienteId: string;
	estado: string;
	cancelado_especialista: string;
	cancelado_paciente: string;
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