import { Injectable, inject } from '@angular/core';
import { collection, Firestore, doc, setDoc, updateDoc, deleteDoc, collectionData, query, where, getDocs} from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { IAdministrador } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
    storage = inject(Storage)   
    firestore = inject(Firestore)

    constructor() { }

    async Alta(administrador:IAdministrador, imagen:Blob, nombreImg:string) {
        try{
            const coleccion = collection(this.firestore, "administradores") 
            const documento = doc(coleccion);
            administrador.id = documento.id;

            let storageRef = ref(this.storage, "imagenes/administradores/" + nombreImg)
            await uploadBytes(storageRef, imagen); 
            const url = await getDownloadURL(storageRef); 
            administrador.imagenPerfil = url

            await setDoc(documento, administrador); 
            return documento.id;
        }
        catch {return "-1"}
    }

    
    async GetAdmin(email:string)
    {
        const adminQuery = query(collection(this.firestore, 'administradores'), where('mail', '==', email));
        const especialistaDocs = await getDocs(adminQuery);
        return especialistaDocs;
    }

	async GetAdminsTotal()
    {
        const adminQuery = query(collection(this.firestore, 'administradores'));
        const especialistaDocs = await getDocs(adminQuery);
        return especialistaDocs;
    }
}
