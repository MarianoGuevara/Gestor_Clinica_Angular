import { Component, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { AlertService } from '../../servicios/alert.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { IAdministrador } from '../../interfaces/interfaces';
import { AdminService } from '../../servicios/admin.service';
import { IUsuario } from '../../interfaces/interfaces';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    BtnDirective
  ],
  templateUrl: './register-admin.component.html',
  styleUrl: './register-admin.component.css'
})
export class RegisterAdminComponent {
    fb = inject(FormBuilder)
    formGroupMio: FormGroup;
    img1: Blob | null = null;
    auth = inject(AuthService);
    loading = inject(LoadingService);
    alert = inject(AlertService);
    adminservice = inject(AdminService)

    constructor()
    {
        this.formGroupMio = this.fb.group({ 
            correo: ["", [Validators.required, Validators.minLength(7), Validators.maxLength(40), Validators.email]], 
            clave: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            nombre: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            apellido: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            edad: ["", [Validators.required, Validators.pattern(/^\d+$/), Validators.min(18), Validators.max(150)]],
            dni: ["", [Validators.required, Validators.pattern(/^\d+$/), Validators.min(10000000), Validators.max(99000000)]],
            imagen: ["", [Validators.required]],
        });
    }

    obtenerMensajeError(campo: string, formGroup:string){
        let control:any = "";
        if (formGroup == "mio"){control = this.formGroupMio.get(campo);}

        if (control?.errors) {
          if (control.errors['required']) {
            return  "'"+campo +"'" + ' es obligatorio.';
          } else if (control.errors['minlength']) {
            return `Cantidad de caracteres inválida (mínimo ${control.errors['minlength'].requiredLength}).`;
          } else if (control.errors['maxlength']) {
            return `Cantidad de caracteres inválida (máximo ${control.errors['maxlength'].requiredLength}).`;
          } else if (control.errors['pattern']) {
            return 'El formato no es válido.';
          } else if (control.errors['min']) {
            return `El valor mínimo es ${control.errors['min'].min}.`;
          } else if (control.errors['max']) {
            return `El valor máximo es ${control.errors['max'].max}.`;
          } else if (control.errors!['email']) {
            return "El email está en formato invalido";
          }
          
          
        }
        return null;
    }


    changeImg($event:any, imgAtr:number)
    {
          const file = $event.target.files[0]
          const img = new Blob([file], {type: file.type})
          if (imgAtr == 1) {this.img1 = img;}
    
    }

    registrarse()
    {
        this.loading.mostrarSpinner();

        const user: IUsuario = {
            nombre: this.formGroupMio.get("nombre")?.value,
            apellido: this.formGroupMio.get("apellido")?.value,
            edad: this.formGroupMio.get("edad")?.value,
            dni: this.formGroupMio.get("dni")?.value,
            mail: this.formGroupMio.get("correo")?.value,
            password: this.formGroupMio.get("clave")?.value,
            imagenPerfil: this.formGroupMio.get("imagen")?.value,
            rol: "", 
            verificado: false,
            id: ""
        };


        this.auth.registarUsuario(user)
        .then(() => {
            this.loading.mostrarSpinner();

            const admin: IAdministrador = {
                nombre: user.nombre,
                apellido: user.apellido,
                edad: user.edad,
                dni: user.dni,
                mail: user.mail,
                password: user.password,
                imagenPerfil: user.imagenPerfil,
                rol: "administrador",
                verificado: true,
                id: "",
            }

          
             
                
            const name = admin.nombre + "-" + admin.mail + "-" +"foto1";

            this.adminservice.Alta(admin, this.img1!, name)
            .then((id) => {
                this.auth.logueado = true;

                if (id != "-1")
                {
                    admin.id = id;
                    this.loading.ocultarSpinner();
                    this.alert.Alerta("Admin Registrado", "Bienvenido a la app, " + user.mail, 'success', this.auth.logueado, "/home");
                }
                else
                {
                    this.alert.Alerta("Fracaso", "Algo falló en el alta del admin", 'error');
                }
            })
            .catch((error) => {
                this.alert.Alerta("Fracaso", error.message, 'error');
            })
            .finally(() => {
                this.loading.ocultarSpinner();
            });
           
           
            

        })
        .catch((error) => {
            let msj = "";
            if ((error as Error).message == 'Firebase: Error (auth/email-already-in-use).') msj = "El correo ingresado ya está en uso, pruebe con otro";
            this.alert.Alerta("Fracaso", msj, 'error');
        })
        .finally(() => {
            this.loading.ocultarSpinner();
        });
    }
}
