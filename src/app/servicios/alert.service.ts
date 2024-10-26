import { Injectable, inject } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2'; // Importa SweetAlertIcon
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
    private router = inject(Router);
   
    constructor() { }

    async Alerta(titulo:string, texto:string, icono:SweetAlertIcon, navegar=false, ruta="")
    {
        return Swal.fire({
            title: titulo,
            text: texto,
            icon: icono, // 'success', 'error', 'warning', 'info', 'question'
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar',
        }).then((result) => {
            if (result.isConfirmed) {
            // Lógica si el usuario confirma
            if (navegar && ruta != "")
            {
                this.router.navigate([ruta]);
            }
            
            }
        });
    }


    async AlertaConDosBotones(titulo: string, texto: string, btn1:string,btn2:string) {
        return Swal.fire({
            title: titulo,
            text: texto,
            icon: 'info',
            showCancelButton: true, // Habilita el botón de cancelar
            confirmButtonColor: '#3a4046',
            cancelButtonColor: '#9941be',
            confirmButtonText: btn1,
            cancelButtonText: btn2
        }).then((result) => {
            if (result.isConfirmed) {
                return true;
            } else {
                return false;
            }
        });
    }
    
}
