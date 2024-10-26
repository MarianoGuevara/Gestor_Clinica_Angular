import { Injectable, inject } from '@angular/core';
import { collection, Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { IPaciente } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
    storage = inject(Storage)   
    firestore = inject(Firestore)

    constructor() { }

    async Alta(paciente:IPaciente, imagen:Blob, nombreImg:string, imagen2:Blob, nombreImg2:string) {

        try{
            const coleccion = collection(this.firestore, "pacientes") 
            const documento = doc(coleccion);
            paciente.id = documento.id;

            let storageRef = ref(this.storage, "imagenes/pacientes/" + nombreImg)
            await uploadBytes(storageRef, imagen); 
            const url = await getDownloadURL(storageRef); 
            paciente.imagenPerfil = url

            let storageRef2 = ref(this.storage, "imagenes/pacientes/" + nombreImg2)
            await uploadBytes(storageRef2, imagen2); 
            const url2 = await getDownloadURL(storageRef2); 
            paciente.imagenPerfil2 = url2

            setDoc(documento, paciente); 
            return documento.id;
        }
        catch {return "-1"}
    }

}
