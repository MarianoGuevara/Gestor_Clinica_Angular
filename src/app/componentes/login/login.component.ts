import { Component, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { AlertService } from '../../servicios/alert.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { IUsuario } from '../../interfaces/interfaces';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LogsService } from '../../servicios/logs.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    BtnDirective
  ],
  animations: [
	trigger('fadeIn', [
		state('show', style({ opacity: 1 })),
		state('hide', style({ opacity: 0 })),
		transition('hide => show', [animate('2s ease-in')]),
		transition('show => hide', [animate('2s ease-out')]),
	])
  ],
  
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
	logs = inject(LogsService);
    auth = inject(AuthService);
    loading = inject(LoadingService);
    alert = inject(AlertService);
    fb = inject(FormBuilder)
    formGroupMio: FormGroup;
	mostrarPacientes: boolean = false;
	mostrarEspecialistas: boolean = false;
	mostrarAdministradores: boolean = false;
	pacientes: any[] = [
		{mail: "mizuumibozu@gmail.com", clave: "123456", img: "https://firebasestorage.googleapis.com/v0/b/clinica-guevara-d4a97.appspot.com/o/imagenes%2Fpacientes%2FFernando-mizuumibozu%40gmail.com-foto1?alt=media&token=3f3128ca-0b46-496b-8140-3cf4f0951d21"},
		{mail: "nicolascapurro2005@gmail.com", clave: "123456", img: "https://firebasestorage.googleapis.com/v0/b/clinica-guevara-d4a97.appspot.com/o/imagenes%2Fpacientes%2FNicolino-nicolascapurro2005%40gmail.com-foto1?alt=media&token=d3619734-7621-45d5-bc8c-1fa38c6ec0c4"},
		{mail: "paciente1@paciente.com", clave: "123456", img: "https://firebasestorage.googleapis.com/v0/b/clinica-guevara-d4a97.appspot.com/o/imagenes%2Fpacientes%2FPaciente-paciente1%40paciente.com-foto1?alt=media&token=0f44ac12-6058-4047-a522-d2d8d71138a9"},
	]
	especialistas: any[] = [
		{mail: "uchimar123@gmail.com", clave: "alejandroSanz", img: "https://firebasestorage.googleapis.com/v0/b/clinica-guevara-d4a97.appspot.com/o/imagenes%2Fespecialistas%2FAlejandro-uchimar123%40gmail.com-foto1?alt=media&token=5e91f8c9-fd91-4a65-a1d2-3f1c87e39ef4"},
		{mail: "marianoguevara2005@gmail.com", clave: "654321", img: "https://firebasestorage.googleapis.com/v0/b/clinica-guevara-d4a97.appspot.com/o/imagenes%2Fespecialistas%2FNicolas-marianoguevara2005%40gmail.com-foto1?alt=media&token=67094207-fea0-442f-9f1a-b50afd9ecd8b"},
	]
	administradores: any[] = [
		{mail: "admin@admin.com", clave: "123456", img: "https://firebasestorage.googleapis.com/v0/b/clinica-guevara-d4a97.appspot.com/o/imagenes%2Fadministradores%2FAdministradorSupremo-admin%40admin.com-foto1?alt=media&token=c680ebe9-5443-432d-8c84-0ded5aa75986"},
	]
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
            console.log(this.formGroupMio.get('correo')?.value);
			console.log(this.formGroupMio.get('clave')?.value);
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
						this.logs.Alta(this.auth.usuarioRealActual);
                        this.alert.Alerta("Exito", "Bienvenido, " + usuario?.mail, 'success', this.auth.logueado, "/bienvenida");
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
