import { Injectable, inject } from '@angular/core';
import { collection, Firestore, doc, setDoc, updateDoc, deleteDoc, collectionData, query, where, getDocs} from '@angular/fire/firestore';
import { IHistoriaClinica } from '../interfaces/interfaces';
@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaService {
	firestore = inject(Firestore)

  	constructor() { }

	  async Alta(historia:IHistoriaClinica) {
        try{
            const coleccion = collection(this.firestore, "hisotriasClinicas") 
            const documento = doc(coleccion);
            historia.id = documento.id;

            await setDoc(documento, historia); 
            return documento.id;
        }
        catch {return "-1"}
    }

	GetHistoriasClinicas() // a esto .subscribe
    {
        let col = collection(this.firestore, 'hisotriasClinicas');
        const observable = collectionData(col);
    
        return observable;
    }

    async GetHistoriasPaciente(idPaciente:string)
    {
        const turnoQuery = query(
			collection(this.firestore, 'hisotriasClinicas'),
		    where('idPaciente', '==', idPaciente), 
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

	async GetHistoriasEspecialista(idEspecialista:string)
    {
        const turnoQuery = query(
			collection(this.firestore, 'hisotriasClinicas'),
		    where('idEspecialista', '==', idEspecialista), 
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

	async GetHistorias()
    {
        const turnoQuery = query(
			collection(this.firestore, 'hisotriasClinicas')
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }

	async GetHistoriaId(id:string)
    {
        const turnoQuery = query(
			collection(this.firestore, 'hisotriasClinicas'),
		    where('id', '==', id), 
		);
        const especialistaDocs = await getDocs(turnoQuery);
        return especialistaDocs;
    }
}
