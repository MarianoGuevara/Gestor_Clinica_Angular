import { Component, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { AlertService } from '../../servicios/alert.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { IUsuario } from '../../interfaces/interfaces';

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


    async loguearse() {
        this.loading.mostrarSpinner();
        try
        {
            console.log(this.formGroupMio);
            const usuario: IUsuario = {
                nombre: "",
                apellido: "",
                edad: -1,
                dni: -1,
                mail: this.formGroupMio.get('correo')?.value || "",
                password: this.formGroupMio.get('clave')?.value || "",
                imagenPerfil: "",
                rol: "",
                verificado: false,
                id: ""
            };
            
            await this.auth.loguearse(usuario)
            .then(async (retorno) => {
                await this.auth.verificarSesion();
                console.log(retorno);

                console.log("LOGIN");
                console.log(this.auth.usuarioRealActual);

                const verificado = await this.auth.verificarEmail();
                if (this.auth.usuarioRealActual?.verificado)
                {
                    if (this.auth.usuarioRealActual.rol == "administrador" || verificado)
                    {
                        this.auth.logueado = true;
                        this.auth.usuarioActual = retorno.user;
                        this.alert.Alerta("Exito", "Bienvenido, " + usuario?.mail, 'success', this.auth.logueado, "/home");
                    }
                    else
                    {
                        this.alert.Alerta("Cuidado", "El usuario no habilitó la cuenta desde el correo", 'warning')
                        .then(()=>{
                            this.auth.cerrarSesion("bienvenida");
                        })      
                    }
                }
                else
                {
                    this.alert.Alerta("Cuidado", "El especialista no fue habilitado por un admin", 'warning')
                    .then(()=>{
                        this.auth.cerrarSesion("bienvenida");
                    })                    
                }
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
