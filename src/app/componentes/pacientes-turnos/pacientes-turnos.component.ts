import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { ITurno } from '../../interfaces/interfaces';
import { TurnosService } from '../../servicios/turnos.service';
import { LoadingService } from '../../servicios/loading.service';
import { AuthService } from '../../servicios/auth.service';
import { Subscription } from 'rxjs';
import { BtnDirective } from '../../directivas/btn.directive';
import { EspecialistasService } from '../../servicios/especialistas.service';
import { PacientesService } from '../../servicios/pacientes.service';
import { IEspecialista } from '../../interfaces/interfaces';
import { IPaciente } from '../../interfaces/interfaces';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap'; 
import { HorariosService } from '../../servicios/horarios.service';

@Component({
  selector: 'app-pacientes-turnos',
  standalone: true,
  imports: [
	BtnDirective,
	FormsModule
  ],
  templateUrl: './pacientes-turnos.component.html',
  styleUrl: './pacientes-turnos.component.css'
})
export class PacientesTurnosComponent {
	turnos: ITurno[] = [];
	turnosFiltrado: ITurno[] = [];
	turnosService = inject(TurnosService);
	loading = inject(LoadingService);
	auth = inject(AuthService);
	suscripcion: Subscription|null = null;
	horariosService = inject(HorariosService);
	especialistasService = inject(EspecialistasService);
	pacientesService = inject(PacientesService);
	arrayParaleloEspecialitas :IEspecialista[] = [];
	filtroActual:string = "";
	@ViewChild('modalCancelar') modalCancelar!: ElementRef;
	accionParaModal:string = "";
	modalInput1:string = "";
	modalInput2:string = "";
	modalOutput1:string = "";
	modalOutput2:string = "";
	accionBotonModal:string = "";
	turnoTocadoActual: ITurno|null = null;


	constructor() {
		this.loading.mostrarSpinner();

		this.turnosService.GetTurnos().subscribe({
            next: (rta: any[]) => {
                this.turnos = [];
                rta.forEach((element) => {
                    const turno: ITurno = {
						id: element.id,
						especialidad: element.especialidad,
						especialistaId: element.especialistaId,
						especialistaNombreApellido: element.especialistaNombreApellido,
						fecha: element.fecha,
						horario: element.horario,
						pacienteId: element.pacienteId,
						pacienteNombreApellido: element.pacienteNombreApellido,
						estado: element.estado,
						rechazado_especialista: element.rechazado_especialista,
						cancelado_especialista: element.cancelado_especialista,
						cancelado_paciente: element.cancelado_paciente,
						cancelado_administrador: element.cancelado_administrador,
						completado_especialista: element.completado_especialista ,
						completado_paciente_encuesta: element.completado_paciente_encuesta,
						completado_paciente_atencion: element.completado_paciente_atencion
                    };

                    this.turnos.push(turno);
                });

				this.filtrarArray();
				this.loading.ocultarSpinner();
            },
            error: (err: any) => {
                console.log('Error ->', (err as Error).message);
            }
        });
	}

	filtrarArray() {
		this.turnosFiltrado = [];
		this.turnos.forEach((turno) => {
			if (this.auth.usuarioRealActual?.rol == "administrador") {this.turnosFiltrado.push(turno)}
			else if (this.auth.usuarioRealActual?.rol == "paciente" && 
				this.auth.usuarioRealActual?.id == turno.pacienteId
				) {this.turnosFiltrado.push(turno)}
			else if (this.auth.usuarioRealActual?.rol == "especialista" && 
				this.auth.usuarioRealActual?.id == turno.especialistaId
				) {this.turnosFiltrado.push(turno)}
		});
	}

	filtroChange(txt:string){
		this.turnosFiltrado = [];
		this.turnos.forEach((turno) => {
			// console.log(txt);
			// console.log(turno.especialidad);
			// console.log(turno.especialidad.includes(txt));
			// console.log(this.auth.usuarioRealActual?.rol == "paciente");
			// console.log(this.auth.usuarioRealActual?.id == turno.pacienteId);
			
			if (this.auth.usuarioRealActual?.rol == "administrador" && (turno.especialidad.includes(txt) || turno.especialistaNombreApellido.includes(txt) )) {
				{this.turnosFiltrado.push(turno)}
			}
			else if (this.auth.usuarioRealActual?.rol == "paciente" && 
				this.auth.usuarioRealActual?.id == turno.pacienteId && 
				(turno.especialidad.includes(txt) || turno.especialistaNombreApellido.includes(txt) )) {this.turnosFiltrado.push(turno)}
			else if (this.auth.usuarioRealActual?.rol == "especialista" && 
				this.auth.usuarioRealActual?.id == turno.especialistaId && 
				(turno.especialidad.includes(txt) || turno.pacienteNombreApellido.includes(txt))
				) {this.turnosFiltrado.push(turno)}
			
		});
	}

	async accionModal(id:string, turnoTocado:ITurno|null=null, accion:string ="abrir") {
		if (id != "") {this.accionParaModal = id;} // esto es para el ngIf del html
		const modalElement = this.modalCancelar.nativeElement;
		console.log(turnoTocado?.estado);

		if (accion == "cerrar") { // si lo llama un boton de la card accion va a ser "abrir"
			// cuando lo voy a cerrar nada primero lo cierro con el boton. 
			this.abrirCerrarModal(accion,modalElement); 
			
			// hago un switch de id; variable que capturé en cuando lo abrí al modal
			// segun sea la acción, llamará a un método u otro... Segun 
			switch (this.accionBotonModal) {
				case 'cancelar':
					console.log(this.modalInput1);
					if (this.auth.usuarioRealActual?.rol == "paciente") {
						await this.cancelarTurnoPaciente(this.turnoTocadoActual!, this.modalInput1);
					}
					else if (this.auth.usuarioRealActual?.rol == "especialista") {
						await this.cancelarTurnoEspecialista(this.turnoTocadoActual!, this.modalInput1);
					}
					else {
						await this.cancelarTurnoAdministrador(this.turnoTocadoActual!, this.modalInput1);
					}
					
					this.abrirCerrarModal(accion,modalElement);
					console.log('Cancelando turno como cliente');
					break;
				case 'aceptar-especialista':
					console.log('Evito que vaya al default');
					break;
				case 'finalizar':
					await this.finalizarEspecialista(this.turnoTocadoActual!, this.modalInput1);
					this.abrirCerrarModal(accion,modalElement);
					break;
				case 'rechazar-especialista':
					this.abrirCerrarModal(accion,modalElement);
					break;
				case 'encuesta-paciente':
					await this.encuestaPaciente(this.turnoTocadoActual!, this.modalInput1, this.modalInput2);
					this.abrirCerrarModal(accion,modalElement);
					break;
					
				default:
					this.abrirCerrarModal(accion,modalElement);
					break;
			}
		} else{
			// aca entra cuando lo toca un boton de la card turno. id == "" y accion == "abrir"
			// cuando lo abro lo único que hago es guardarme en una variable de .ts el id.
			this.accionBotonModal = id;
			this.turnoTocadoActual = turnoTocado;
			console.log(this.accionBotonModal);

			// hay acciones de los turnos que no necesitan que se abra el modal como un especialista aceptando turno			
			switch (this.accionBotonModal) 
			{
				case 'vercomentario':
					this.verComentario(this.turnoTocadoActual!);
					this.abrirCerrarModal(accion,modalElement); 
					break;
				case "aceptar-especialista":
					await this.aceptarEspecialista(this.turnoTocadoActual!);
					break;
				case "cancelar":
				case "finalizar":
				case 'encuesta-paciente':
					this.abrirCerrarModal(accion,modalElement); 
					break;
			}
			
		}
	}

	async cancelarTurnoPaciente(turno: ITurno, comentario:string) {
		turno.cancelado_paciente = comentario;	
		turno.estado = "Cancelado";
		await this.turnosService.actualizarTurno(turno);
	}
	async cancelarTurnoEspecialista(turno: ITurno, comentario:string) {
		turno.cancelado_especialista = comentario;	
		turno.estado = "Cancelado";
		await this.turnosService.actualizarTurno(turno);
	}
	async cancelarTurnoAdministrador(turno: ITurno, comentario:string) {
		turno.cancelado_administrador = comentario;	
		turno.estado = "Cancelado";
		await this.turnosService.actualizarTurno(turno);
	}
	
	async verComentario(turno: ITurno) {
		if (turno.cancelado_administrador != "") {this.modalOutput1 = "TURNO CANCELADO POR UN ADMINISTRADOR: " + turno.cancelado_administrador;}
		else if (turno.cancelado_paciente != "") {this.modalOutput1 = "TURNO CANCELADO POR EL PACIENTE: " + turno.cancelado_paciente;}
		else if (turno.cancelado_especialista != "") {this.modalOutput1 = "TURNO CANCELADO POR EL ESPECIALISTA: " + turno.cancelado_especialista;}
		else if (turno.rechazado_especialista != "") {this.modalOutput1 = "TURNO RECHAZADO POR EL ESPECIALISTA: " + turno.rechazado_especialista;}
		else if (turno.estado == "Finalizado") {
			if (turno.completado_especialista != ""){
				this.modalOutput1 = "TURNO FINALIZADO... RESEÑA/DIAGNOSTICO: " + turno.completado_especialista;
			} 
			if (turno.completado_paciente_atencion != "") {
				this.modalOutput2 = "DEL PACIENTE ENCUESTA (" + turno.completado_paciente_encuesta + ")... CALIFICACION: (" + turno.completado_paciente_atencion + ")";
			}
			console.log(this.modalOutput2);
		}
	}
	async aceptarEspecialista(turno: ITurno) {
		turno.estado = "Aceptado";
		await this.turnosService.actualizarTurno(turno);
	}
	async finalizarEspecialista(turno: ITurno, comentario:string) {
		turno.estado = "Finalizado";
		turno.completado_especialista = comentario;
		await this.turnosService.actualizarTurno(turno);
	}
	async encuestaPaciente(turno: ITurno, comentario:string, calificacion:string) {
		turno.completado_paciente_encuesta = comentario;
		turno.completado_paciente_atencion = calificacion;
		await this.turnosService.actualizarTurno(turno);
	}

	abrirCerrarModal(accion:string, modalElement:any){
		if (accion === 'cerrar') {
			modalElement.classList.remove('show');  
			modalElement.style.display = 'none';
			document.body.classList.remove('modal-open'); 
			const backdrop = document.querySelector('.modal-backdrop');
			if (backdrop) backdrop.remove(); 
		  } else if (accion == "abrir"){
			modalElement.classList.add('show'); 
			modalElement.style.display = 'block';
			document.body.classList.add('modal-open'); 
			const backdrop = document.createElement('div');
			backdrop.classList.add('modal-backdrop', 'fade', 'show');
			document.body.appendChild(backdrop); 
		  }
	}

	ngOnDestroy(): void {
		if (this.suscripcion) {this.suscripcion.unsubscribe();}
	}
}
