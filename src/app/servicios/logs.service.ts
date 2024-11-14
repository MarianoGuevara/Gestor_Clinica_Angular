import { Injectable, inject } from '@angular/core';
import { collection, Firestore, doc, setDoc, updateDoc, deleteDoc, collectionData, query, where, getDocs} from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { IEspecialista, IUsuario } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
	firestore = inject(Firestore)

	constructor() { }
	
	async Alta(user:IUsuario) {
        try{
            const coleccion = collection(this.firestore, "logs") 
            const documento = doc(coleccion);

			const fechaActual = new Date();
			const fechaFormateada = `${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}-${fechaActual.getDate().toString().padStart(2, '0')}`;
			const horaFormateada = `${fechaActual.getHours().toString().padStart(2, '0')}:${fechaActual.getMinutes().toString().padStart(2, '0')}`;
	
			const agregable = {
				id: documento.id,
				fecha: fechaFormateada,
				horario: horaFormateada,
				id_user: user.id,
				nombre_user: user.nombre + ", " + user.apellido,

			}

            await setDoc(documento, agregable); 
            return documento.id;
        }
        catch {return "-1"}
    }

	async GetLogs() {
		const queryLogs = query(
			collection(this.firestore, 'logs')
		);
        const queryDocs = await getDocs(queryLogs);
        return queryDocs;
	}
}
