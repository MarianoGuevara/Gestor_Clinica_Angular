import { Injectable, inject } from '@angular/core';
import { collection, Firestore, doc, setDoc, updateDoc, deleteDoc, collectionData, query, where, getDocs} from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { IEspecialista } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class EspecialistasService {
    storage = inject(Storage)   
    firestore = inject(Firestore)

    constructor() { }

    async Alta(especialista:IEspecialista, imagen:Blob, nombreImg:string) {
        try{
            const coleccion = collection(this.firestore, "especialistas") 
            const documento = doc(coleccion);
            especialista.id = documento.id;

            let storageRef = ref(this.storage, "imagenes/especialistas/" + nombreImg)
            await uploadBytes(storageRef, imagen); 
            const url = await getDownloadURL(storageRef); 
            especialista.imagenPerfil = url

            console.log(documento);
            console.log(especialista);
            await setDoc(documento, especialista); 
            return documento.id;
        }
        catch {return "-1"}
    }

    GetEspecialistas() 
    {
        let col = collection(this.firestore, 'especialistas');
        const observable = collectionData(col);
    
        return observable;
    }
	
	async GetEspecialistasNormal()
    {
        const especialistaQuery = query(
			collection(this.firestore, 'especialistas'), 
		);
        const especialistaDocs = await getDocs(especialistaQuery);
        return especialistaDocs;
    }

	async GetEspecialistaId(id:string)
    {
        const especialistaQuery = query(collection(this.firestore, 'especialistas'), where('id', '==', id));
        const especialistaDocs = await getDocs(especialistaQuery);
        return especialistaDocs;
    }
	
	async GetEspecialistaNombreApellido(nombre:string, apellido:string)
    {
        const especialistaQuery = query(collection(this.firestore, 'especialistas'), 
		where('nombre', '==', nombre), where('apellido', '==', apellido));
        const especialistaDocs = await getDocs(especialistaQuery);
        return especialistaDocs;
    }

    async GetEspecialista(email:string)
    {
        const especialistaQuery = query(collection(this.firestore, 'especialistas'), where('mail', '==', email));
        const especialistaDocs = await getDocs(especialistaQuery);
        return especialistaDocs;
    }
    async GetEspecialistasTotal()
    {
        const especialistaQuery = query(collection(this.firestore, 'especialistas'));
        const especialistaDocs = await getDocs(especialistaQuery);
        return especialistaDocs;
    }

    async actualizarEspecialista(especialista:IEspecialista)
    {
        try {        
            const col = collection(this.firestore, 'especialistas');
            const documento = doc(col, especialista.id);
            // console.log(documento);
            await updateDoc(documento, {
                nombre: especialista.nombre,
                apellido: especialista.apellido,
                edad: especialista.edad,
                dni: especialista.dni,
                mail: especialista.mail,
                password: especialista.password,
                imagenPerfil: especialista.imagenPerfil,
                rol: especialista.rol,
                verificado: especialista.verificado,
                id: especialista.id,
                especialidad: especialista.especialidad 
            });
            return true
        }
        catch {return false;}
    }

	// 
	async obtenerEspecialidadDetalles(especialidad:string) {
		const especialidadQuery = query(collection(this.firestore, 'especialidades'), where('nombre', '==', especialidad));
        const especialidadDocs = await getDocs(especialidadQuery);
        return especialidadDocs;
	}
}
