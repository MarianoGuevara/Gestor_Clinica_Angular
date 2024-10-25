import { Component, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { AlertService } from '../../servicios/alert.service';
import { Usuario } from '../../clases/usuario';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    BtnDirective
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

    constructor(){
        this.formGroupMio = this.fb.group({ 
            correo: ["", [Validators.required, Validators.minLength(7), Validators.maxLength(40), Validators.email]], 
            clave: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            nombre: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            apellido: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            edad: ["", [Validators.required, Validators.pattern(/^\d+$/), Validators.min(18), Validators.max(150)]],
            dni: ["", [Validators.required, Validators.pattern(/^\d+$/), Validators.min(45000000), Validators.max(99000000)]],
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


        this.loading.mostrarSpinner();

        this.alert.AlertaConDosBotones("Cual será su rol en el sistema?", "Usted se quiere registrar como paciente o especialista?", "Paciente", "Especialista")
        .then((retorno) => {
            if (retorno) 
            {
                this.rol = "paciente";
            }
            else
            {
                this.rol = "especialista"
            }
        })
        .catch((error) => {
            console.log((error as Error).message);
        })
        .finally(() => {
            this.loading.ocultarSpinner();
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
    // resetSelect() {
    //     this.selectedValue = null; // O puedes usar un valor temporal que no esté en las opciones
    // }
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
}
