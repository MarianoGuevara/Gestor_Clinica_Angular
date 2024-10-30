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

    // async GetTurno(email:string)
    // {
    //     const TurnoQuery = query(collection(this.firestore, 'Turnos'), where('mail', '==', email));
    //     const especialistaDocs = await getDocs(TurnoQuery);
    //     return especialistaDocs;
    // }
}
