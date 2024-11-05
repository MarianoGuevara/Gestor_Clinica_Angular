import { Component, inject, Input } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { AlertService } from '../../servicios/alert.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { PacientesService } from '../../servicios/pacientes.service';
import { EspecialistasService } from '../../servicios/especialistas.service';
import { IEspecialista, IPaciente } from '../../interfaces/interfaces'; 
import { IAdministrador } from '../../interfaces/interfaces';
import { IUsuario } from '../../interfaces/interfaces';
import { CaptchaComponent } from "../captcha/captcha.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    BtnDirective,
    CaptchaComponent
],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
    auth = inject(AuthService);
    loading = inject(LoadingService);
    alert = inject(AlertService);
    fb = inject(FormBuilder)
    formGroupMio: FormGroup;
    formPaciente: FormGroup;
    formEspecialista : FormGroup;
    rol:string = "";
    arrayEspecialidades: string[] = [];
    img1: Blob | null = null;
    img2: Blob | null = null;
    pacientesService = inject(PacientesService)
    especialistasService = inject(EspecialistasService)
	rolElegido:boolean = false;
	@Input() admin: IAdministrador|null = null;
	captchaCompleto: boolean = false;

    constructor(){
        this.formGroupMio = this.fb.group({ 
            correo: ["", [Validators.required, Validators.minLength(7), Validators.maxLength(40), Validators.email]], 
            clave: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            nombre: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            apellido: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            edad: ["", [Validators.required, Validators.pattern(/^\d+$/), Validators.min(18), Validators.max(150)]],
            dni: ["", [Validators.required, Validators.pattern(/^\d+$/), Validators.min(10000000), Validators.max(99000000)]],
            imagen: ["", [Validators.required]],
        });

        this.formPaciente = this.fb.group({
            obraSocial: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            imagen2: ["", [Validators.required]],
        });

        this.formEspecialista = this.fb.group({
            especialidad: ["", Validators.required],    
            especialidadPropia: ["", []]
        });

    }

    obtenerMensajeError(campo: string, formGroup:string){
        let control:any = "";
        if (formGroup == "mio"){control = this.formGroupMio.get(campo);}
        else if (formGroup == "paciente"){control = this.formPaciente.get(campo);}
        else if (formGroup == "especialista"){ control = this.formEspecialista.get(campo);}

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
    


    registrarse()
    {
		if (this.captchaCompleto) {
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

            if (this.rol == "paciente")
            {
                const paciente: IPaciente = {
                    nombre: user.nombre,
                    apellido: user.apellido,
                    edad: user.edad,
                    dni: user.dni,
                    mail: user.mail,
                    password: user.password,
                    imagenPerfil: user.imagenPerfil,
                    rol: this.rol,
                    verificado: true,
                    id: "",
                    obraSocial: this.formPaciente.get("obraSocial")?.value,
                    imagenPerfil2: this.formPaciente.get("imagen2")?.value
                };
                
                const name1 = paciente.nombre + "-" + paciente.mail + "-" +"foto1";
                const name2 = paciente.nombre + "-" + paciente.mail + "-" +"foto2";
                (this.pacientesService.Alta(paciente, this.img1!, name1, this.img2!, name2))
                .then((id) => {
                    if (id != "-1")
                    {
                        console.log(id);
                        paciente.id = id;
                        this.loading.ocultarSpinner();
                        this.alert.Alerta("Paciente Registrado, verificar correo", "Bienvenido a la app, " + user.mail, 'success');
                        this.auth.cerrarSesion("/login");

						if (this.admin != null) {this.auth.loguearse(this.admin);}
                    }
                    else
                    {
                        this.alert.Alerta("Fracaso", "Algo falló en el alta del paciente", 'error');
                    }
                })
                .catch((error) => {
                    this.alert.Alerta("Fracaso", error.message, 'error');
                })
                .finally(() => {
                    this.loading.ocultarSpinner();
                });
            }
            else
            {
                const especialista: IEspecialista = {
                    nombre: user.nombre,
                    apellido: user.apellido,
                    edad: user.edad,
                    dni: user.dni,
                    mail: user.mail,
                    password: user.password,
                    imagenPerfil: user.imagenPerfil,
                    rol: this.rol,
                    verificado: false,
                    id: "",
                    especialidad: this.arrayEspecialidades
                };
                
                const name1 = especialista.nombre + "-" + especialista.mail + "-" +"foto1";
                this.especialistasService.Alta(especialista, this.img1!, name1)
                .then((id) => {

                    if (id != "-1")
                    {
                        especialista.id = id;
                        this.loading.ocultarSpinner();
                        this.alert.Alerta("Especialista Registrado, verificar correo", "Bienvenido a la app, " + user.mail, 'success');

						if (this.admin != null) {this.auth.loguearse(this.admin);}
						else {this.auth.cerrarSesion("/login");}
                    }
                    else
                    {
                        this.alert.Alerta("Fracaso", "Algo falló en el alta del paciente", 'error');
                    }
                })
                .catch((error) => {
                    this.alert.Alerta("Fracaso", error.message, 'error');
                })
                .finally(() => {
                    this.loading.ocultarSpinner();
                });
            }

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
		else
		{
			this.alert.Alerta("Fracaso!", "Debes verificar que no eres un robot antes de registrarte", "error");
		}
    }

    LlenarUsers(mail:string, pass:string)
    {
        this.formGroupMio.patchValue({
            correo: mail,
            clave: pass      
        });
    }


    ////////////////////////////// ESPECIALIDAD ///////////////////////////

    borrarEspecialidad(index:number)
    {
        this.arrayEspecialidades.splice(index, 1); // 1 -> cantidad de indices desde index a eliminar
    }

    especialidadPropia()
    {
        const str = this.formEspecialista.get('especialidadPropia')?.value
        if (!this.especialidadExistente(str))
        { 
            this.arrayEspecialidades.push(str); 
            this.formEspecialista.patchValue({
                especialidadPropia: ""
            });
        }
    }

    clickSelect(opc:any)
    {
        console.log("EVALUA")
        const selectedValue = opc.target.value;
        if (!this.especialidadExistente(selectedValue)){ this.arrayEspecialidades.push(selectedValue); }
        opc = null;
    }

    especialidadExistente(str:string)
    {
        let encontrado = false;
        for (let i=0; i<this.arrayEspecialidades.length; i++)
        {
            console.log(this.arrayEspecialidades[i])
            if (this.arrayEspecialidades[i] == str)
            {
                console.log("TRUEEE")
                encontrado = true;
            }
        }
        console.log(encontrado);
        return encontrado;
    }

    ///////////// BLOB /////////////////
    changeImg($event:any, imgAtr:number)
    {
        const file = $event.target.files[0]
        const img = new Blob([file], {type: file.type})
        if (imgAtr == 1) {this.img1 = img;}
        else if (imgAtr == 2){
            this.img2 = img; 
            console.log(this.formPaciente.get("imagen2")?.value);
        }
    }

	enCaptchaCompletado(completado: any) {
		this.captchaCompleto = completado;
	}
}
