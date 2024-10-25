import { Component, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { AlertService } from '../../servicios/alert.service';
import { Usuario } from '../../clases/usuario';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    BtnDirective
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
    auth = inject(AuthService);
    loading = inject(LoadingService);
    alert = inject(AlertService);
    fb = inject(FormBuilder)
    formGroupMio: FormGroup;

    constructor(){
        this.formGroupMio = this.fb.group({ 
            correo: ["", [Validators.required, Validators.minLength(7), Validators.maxLength(40), Validators.email]], 
            clave: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(30)]]
        });
    }


    loguearse() {
        this.loading.mostrarSpinner();
        try
        {
            console.log(this.formGroupMio);
            const usuario = new Usuario("", "",-1, -1, this.formGroupMio.get('correo')?.value, this.formGroupMio.get('clave')?.value, "", "", false);
    
            this.auth.loguearse(usuario)
            .then((retorno) => {
                console.log(retorno);
                
                this.auth.logueado = true;
                this.auth.usuarioActual = retorno.user;
                this.alert.Alerta("Exito", "Bienvenido, " + usuario?.mail, 'success', this.auth.logueado, "/home");
            })
            .catch((error) => {
                console.log((error as Error).message);
                
                let msj = "";
                if ((error as Error).message == 'Firebase: Error (auth/invalid-credential).') msj = "Correo y/o clave invalido";
                this.alert.Alerta("Fracaso", msj, 'error');
            })
            .finally(() => {
                this.loading.ocultarSpinner();
            });
        }
        catch (e)
        {
            this.alert.Alerta("Fracaso", (e as Error).message, 'error');
        }
    }


    LlenarUsers(mail:string, pass:string)
    {
        this.formGroupMio.patchValue({
            correo: mail,
            clave: pass
            
        });
    }
}
