import { Component, Inject, inject, ViewChild } from '@angular/core';
import { IEspecialista, IPaciente, ITurno, IUsuario } from '../../interfaces/interfaces';
import { EspecialistasService } from '../../servicios/especialistas.service';
import { PacientesService } from '../../servicios/pacientes.service';
import { Subscription } from 'rxjs';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { RegisterAdminComponent } from "../register-admin/register-admin.component";
import { AuthService } from '../../servicios/auth.service';
import { AlertService } from '../../servicios/alert.service';
import { Router, RouterLink } from '@angular/router';
import { GenerarExcelComponent } from "../generar-excel/generar-excel.component";
import jsPDF from 'jspdf';
import { TurnosService } from '../../servicios/turnos.service';

@Component({
  selector: 'app-seccion-usuarios-admin',
  standalone: true,
  imports: [
    BtnDirective,
    RegisterAdminComponent,
    RouterLink,
    GenerarExcelComponent
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
	turnosService = inject(TurnosService);
	@ViewChild(GenerarExcelComponent) excelComponente!: GenerarExcelComponent;

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

	async excel() {
		this.loading.mostrarSpinner();
		await this.excelComponente.exportToExcel();
		this.loading.ocultarSpinner();
	}

	async pdfUsuariosTurnos(id:string, apellido:string) {
		this.loading.mostrarSpinner();

		const doc = new jsPDF();
		const logoData = 'assets/logo.png';
	  
		doc.addImage(logoData, 'PNG', 70, 10, 50, 50);
		doc.setFontSize(16);
		doc.text('Turnos', 76, 70);
		doc.setFontSize(12);
		doc.text(`Paciente: ${apellido}`, 10, 80);
		
		let yOffset = 110;
	  

		const turnosDb = await this.turnosService.GetTurnosPaciente(id);
		for (let i = 0; i < turnosDb.docs.length; i++) {
			const turnoActual = turnosDb.docs[i].data() as ITurno;

			doc.setFontSize(12);
			doc.text(`Fecha: ${turnoActual.fecha}, ${turnoActual.horario} hs`, 10, yOffset);
			yOffset += 10;
			doc.text(`Especialista: ${turnoActual.especialistaNombreApellido}`, 10, yOffset);
			yOffset += 10;
			doc.text(`Especialidad: ${turnoActual.especialidad}`, 10, yOffset);
			yOffset += 10;
			doc.text(`Estado del turno: ${turnoActual.estado}`, 10, yOffset);
			yOffset += 10;
			doc.text('____________________', 10, yOffset);
			yOffset += 10;

			if (yOffset > 280) {
			doc.addPage();
			yOffset = 20; // Reiniciar el yOffset en la nueva página
			}
		}

		const fileName = `Turnos_${apellido}_${new Date().toISOString()}.pdf`;
		doc.save(fileName);
	  
		this.loading.ocultarSpinner();
	}
}