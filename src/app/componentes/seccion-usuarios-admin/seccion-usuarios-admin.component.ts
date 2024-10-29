import { Component, Inject, inject  } from '@angular/core';
import { IEspecialista, IPaciente, IUsuario } from '../../interfaces/interfaces';
import { EspecialistasService } from '../../servicios/especialistas.service';
import { PacientesService } from '../../servicios/pacientes.service';
import { Subscription } from 'rxjs';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { RegisterAdminComponent } from "../register-admin/register-admin.component";
import { AuthService } from '../../servicios/auth.service';
import { AlertService } from '../../servicios/alert.service';

@Component({
  selector: 'app-seccion-usuarios-admin',
  standalone: true,
  imports: [
    BtnDirective,
    RegisterAdminComponent
],
  templateUrl: './seccion-usuarios-admin.component.html',
  styleUrl: './seccion-usuarios-admin.component.css'
})
export class SeccionUsuariosAdminComponent {
    arrayEspecialistas: IEspecialista[] = [];
    arrayPacientes: IPaciente[] = [];
    arrayUsuarios: IUsuario[] = [];
    serviceEspecialistas = inject(EspecialistasService);
    servicePacientes = inject(PacientesService);
    suscripcionPacientes: Subscription|null = null;
    suscripcionEspecialistas: Subscription|null = null;
    loading = inject(LoadingService);
    auth = inject(AuthService);
    alert = inject(AlertService);

    ngOnInit(): void {
        this.loading.mostrarSpinner();
        
        this.suscripcionPacientes = this.servicePacientes.GetPacientes().subscribe({
            next: (rta: any[]) => {
                this.arrayPacientes = [];
                rta.forEach((element) => {
                    const paciente: IPaciente = {
                        nombre: element.nombre,
                        apellido: element.apellido,
                        edad: element.edad,
                        dni: element.dni,
                        mail: element.mail,
                        password: element.password,
                        imagenPerfil: element.imagenPerfil,
                        rol: element.rol,
                        verificado: element.verificado,
                        id: element.id,
                        obraSocial: element.obraSocial,
                        imagenPerfil2: element.imagenPerfil2,
                    };

                    this.arrayPacientes.push(paciente);
                });
            },
            error: (err: any) => {
                console.log('Error ->', (err as Error).message);
            }
        });


        this.suscripcionEspecialistas = this.serviceEspecialistas.GetEspecialistas().subscribe({
            next: (rta: any[]) => {
                this.arrayEspecialistas = [];
                rta.forEach((element) => {
                    const especialista: IEspecialista = {
                        nombre: element.nombre,
                        apellido: element.apellido,
                        edad: element.edad,
                        dni: element.dni,
                        mail: element.mail,
                        password: element.password,
                        imagenPerfil: element.imagenPerfil,
                        rol: element.rol,
                        verificado: element.verificado,
                        id: element.id,
                        especialidad: element.especialidad,
                    };

                    this.arrayEspecialistas.push(especialista);
                });


                this.arrayUsuarios = [...this.arrayPacientes, ...this.arrayEspecialistas];
                this.loading.ocultarSpinner();
            },
            error: (err: any) => {
                console.log('Error ->', (err as Error).message);
            },
            finally: () => {
                console.log(this.arrayUsuarios);
            }
        });
    }

    isPaciente(user: IUsuario): user is IPaciente {
        return (user as IPaciente).obraSocial !== undefined && (user as IPaciente).imagenPerfil2 !== undefined;
    }
    isEspecialista(user: IUsuario): user is IEspecialista {
        return (user as IEspecialista).especialidad !== undefined;
    }

    ngOnDestroy(): void {
        this.suscripcionPacientes?.unsubscribe();
        this.suscripcionEspecialistas?.unsubscribe();
    }

    async habilitarEspecialista(user:IUsuario)
    {
        this.loading.mostrarSpinner();
        
        user.verificado = true;
        const rta = await this.serviceEspecialistas.actualizarEspecialista(user as IEspecialista)

		if (rta){
			this.alert.Alerta("HABILITADO", "El especialista fue habilitado correctamente", 'success').then(()=>{
				this.loading.ocultarSpinner();
			});
		}
		else {this.alert.Alerta("ERROR", "El especialista no pudo ser habilitado", 'error').then(()=>{
				this.loading.ocultarSpinner();
			});
		}
    }
    deshabilitarEspecialista(user:IUsuario)
    {
        this.loading.mostrarSpinner();
        
        user.verificado = false;
        this.serviceEspecialistas.actualizarEspecialista(user as IEspecialista)
        .then((rta) => {
            if (rta){
                this.alert.Alerta("DESHABILITADO", "El especialista fue deshabilitado correctamente", 'success').finally(()=>{
                    this.loading.ocultarSpinner();
                });
            }
            else {this.alert.Alerta("ERROR", "El especialista no pudo ser deshabilitado", 'error').finally(()=>{
                    this.loading.ocultarSpinner();
                });
            }
        })
    }
}