import { Injectable, inject } from '@angular/core';
import { collection, Firestore, doc, setDoc, updateDoc, deleteDoc, collectionData, query, where, getDocs} from '@angular/fire/firestore';
import { ITurno } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
    firestore = inject(Firestore)

	constructor() { }

  	async Alta(turno:ITurno) {
		try{
			const coleccion = collection(this.firestore, "turnos") 
			const documento = doc(coleccion);
			turno.id = documento.id;

			await setDoc(documento, turno); 
			return documento.id;
		}
		catch {return "-1"}
	}	

	GetTurnos() 
    {
        let col = collection(this.firestore, 'turnos');
        const observable = collectionData(col);
    
        return observable;
    }

	async GetTurnosNormal()
    {
        const turnoQuery = query(
			collection(this.firestore, 'turnos'),
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

	async GetTurnoId(id:string)
    {
        const turnoQuery = query(
			collection(this.firestore, 'turnos'),
		    where('id', '==', id), 
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

	async GetTurnosPaciente(pacienteId:string)
    {
        const turnoQuery = query(
			collection(this.firestore, 'turnos'),
		    where('pacienteId', '==', pacienteId), 
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

	async GetTurnosSolicitadosEspecialistaFecha(idEspecialista:string, fecha:string)
    {
        const turnoQuery = query(
			collection(this.firestore, 'turnos'),
		    where('especialistaId', '==', idEspecialista), 
			where('estado', '==', 'Pendiente de aprobacion'), 
			where('fecha', '==', fecha), 
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

	async GetTurnosFinalizadosEspecialistaFecha(idEspecialista:string, fecha:string)
    {
        const turnoQuery = query(
			collection(this.firestore, 'turnos'),
		    where('especialistaId', '==', idEspecialista), 
			where('estado', '==', 'Finalizado'), 
			where('fecha', '==', fecha), 
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

    async GetTurnosEspecialistaId(idEspecialista:string)
    {
        const turnoQuery = query(
			collection(this.firestore, 'turnos'),
		    where('especialistaId', '==', idEspecialista), 
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

	async GetTurnosHorario(horario:string, fecha:string)
    {
        const turnoQuery = query(
			collection(this.firestore, 'turnos'),
		    where('horario', '==', horario), 
			where('fecha', '==', fecha)
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

	async GetTurnosDia(fecha:string)
    {
        const turnoQuery = query(
			collection(this.firestore, 'turnos'),
			where('fecha', '==', fecha)
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

	async actualizarTurno(turno:ITurno)
    {
        try {        
            const col = collection(this.firestore, 'turnos');
            const documento = doc(col, turno.id);
			console.log(documento);
            await updateDoc(documento, {
				id: turno.id,
				especialidad: turno.especialidad,
				especialistaId: turno.especialistaId,
				especialistaNombreApellido: turno.especialistaNombreApellido,
				fecha: turno.fecha,
				horario: turno.horario,
				pacienteId: turno.pacienteId,
				pacienteNombreApellido: turno.pacienteNombreApellido,
				estado: turno.estado,
				rechazado_especialista: turno.rechazado_especialista,
				cancelado_especialista: turno.cancelado_especialista,
				cancelado_paciente: turno.cancelado_paciente,
				cancelado_administrador: turno.cancelado_administrador,
				completado_especialista: turno.completado_especialista,
				completado_paciente_encuesta: turno.completado_paciente_encuesta,
				completado_paciente_atencion: turno.completado_paciente_atencion
            });
            return true
        }
		catch (error) {
			console.error("Error al actualizar el turno:", error);
			return false;
		}
    }
}
