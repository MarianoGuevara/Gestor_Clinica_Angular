import { Injectable, inject } from '@angular/core';
import { collection, Firestore, doc, setDoc, updateDoc, deleteDoc, collectionData, query, where, getDocs} from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { IHorariosEspecialista } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
	firestore = inject(Firestore)

 	constructor() { }

	async Alta(horario: IHorariosEspecialista)
	{
		const coleccion = collection(this.firestore, "horariosEspecialistas") 
		const documento = doc(coleccion);
		horario.id = documento.id;

		await setDoc(documento, horario); 
		return documento.id;
	}

	GetHorarios() 
    {
        let col = collection(this.firestore, 'horariosEspecialistas');
        const observable = collectionData(col);
    
        return observable;
    }

	async GetHorario(idEspecialista:string)
    {
        const horarioQuery = query(collection(this.firestore, 'horariosEspecialistas'), where('idEspecialista', '==', idEspecialista));
        const horarioDocs = await getDocs(horarioQuery);
        return horarioDocs;
    }

	async actualizarHorarios(horarios:IHorariosEspecialista)
    {
		console.log("ACTUALIZANDO...");
		console.log(horarios);
        try {        
            const col = collection(this.firestore, 'horariosEspecialistas');
            const documento = doc(col, horarios.id);

            await updateDoc(documento, {
                lunes: horarios.lunes,
                martes: horarios.martes,
                miercoles: horarios.miercoles,
                jueves: horarios.jueves,
                viernes: horarios.viernes,
                sabado: horarios.sabado
            });
            return true
        }
        catch {return false;}
    }
}
