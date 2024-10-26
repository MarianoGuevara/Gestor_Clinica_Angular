import { Injectable, inject } from '@angular/core';
import { collection, Firestore, doc, setDoc } from '@angular/fire/firestore';
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

            setDoc(documento, especialista); 
            return documento.id;
        }
        catch {return "-1"}
    }

}
