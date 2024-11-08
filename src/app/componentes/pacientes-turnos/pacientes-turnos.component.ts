import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { IHistoriaClinica, ITurno } from '../../interfaces/interfaces';
import { TurnosService } from '../../servicios/turnos.service';
import { LoadingService } from '../../servicios/loading.service';
import { AuthService } from '../../servicios/auth.service';
import { Subscription } from 'rxjs';
import { BtnDirective } from '../../directivas/btn.directive';
import { EspecialistasService } from '../../servicios/especialistas.service';
import { PacientesService } from '../../servicios/pacientes.service';
import { IEspecialista } from '../../interfaces/interfaces';
import { IPaciente } from '../../interfaces/interfaces';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from 'bootstrap'; 
import { HorariosService } from '../../servicios/horarios.service';
import { HistoriaClinicaService } from '../../servicios/historia-clinica.service';

@Component({
  selector: 'app-pacientes-turnos',
  standalone: true,
  imports: [
	BtnDirective,
	FormsModule,
    ReactiveFormsModule,
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
	historiasClinicasService = inject(HistoriaClinicaService);
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
	modalInputAltura:string = "";
	modalInputPeso:string = "";
	modalInputTemperatura:string = "";
	modalInputPresion:string = "";
	modalInputDinamico1:string = "";
	modalInputDinamico2:string = "";
	modalInputDinamico3:string = "";

	modalOutput1:string = "";
	modalOutput2:string = "";
	accionBotonModal:string = "";
	turnoTocadoActual: ITurno|null = null;
	fb = inject(FormBuilder);
	formGroupHistoriaClinica: FormGroup;

	constructor() {
		this.formGroupHistoriaClinica = this.fb.group({ 
            altura: ["", [Validators.required, Validators.pattern(/^\d+$/), Validators.min(75), Validators.max(275)]], 
            peso: ["", [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(550)]],
            temperatura: ["", [Validators.required, Validators.pattern(/^\d+$/), Validators.min(20), Validators.max(60)]],
            presion: ["", [Validators.required, Validators.min(70), Validators.max(140)]],
            dinamico1: ["", [Validators.pattern(/^[\w\s]+,[\w]+$/)]], // cualquier letra y num
            dinamico2: ["", [Validators.pattern(/^[\w\s]+,[\w]+$/)]], // cualquier letra y num
            dinamico3: ["", [Validators.pattern(/^[\w\s]+,[\w]+$/)]], // cualquier letra y num
        });


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

	async filtroChange(txt:string, accion:string = "buscar"){
		if ((txt == "" || txt == " " || txt == "  ")&& accion == "buscar") {}
		else
		{
			this.turnosFiltrado = [];
			this.turnos.forEach(async (turno) => {
				if (this.auth.usuarioRealActual?.rol == "administrador" && (turno.especialidad.includes(txt) || turno.especialistaNombreApellido.includes(txt) )) {
					{this.turnosFiltrado.push(turno)}
				}
				else if (await this.condicionPacienteEspecialista(turno, txt, "paciente") && !(this.turnosFiltrado.includes(turno))) {
					this.turnosFiltrado.push(turno)
				}
				else if (await this.condicionPacienteEspecialista(turno, txt, "especialista") && !(this.turnosFiltrado.includes(turno))) {this.turnosFiltrado.push(turno)}
				
			});
			this.filtroActual = ""
		}
		
	}


	async condicionPacienteEspecialista(turno:ITurno, txt:string, rol:string) {
		let retorno:boolean;
		let retorno2:boolean = false;
		let retorno3:boolean = false;

		if (rol == "paciente") {
			retorno = (
				(this.auth.usuarioRealActual?.rol == "paciente" && 
				this.auth.usuarioRealActual?.id == turno.pacienteId) 
			);
		} else {
			retorno = (
				this.auth.usuarioRealActual?.rol == "especialista" && 
				this.auth.usuarioRealActual?.id == turno.especialistaId
			);
			
		}
		
		if (retorno) {

			retorno2 = turno.especialidad.includes(txt) || turno.especialistaNombreApellido.includes(txt);

			const histTurnoDb = await this.historiasClinicasService.GetHistoriaTurno(turno.id);

			if (turno.estado == "Finalizado")  {
				const historiaDbReal = histTurnoDb.docs[0].data() as IHistoriaClinica;

				retorno3 = (
					(historiaDbReal.altura.toString().includes(txt) || 
					historiaDbReal.peso.toString().includes(txt) ||
					historiaDbReal.presion.toString().includes(txt) ||
					historiaDbReal.temperatura.toString().includes(txt)
					)
					||
					(historiaDbReal.dinamico1 != "" && historiaDbReal.dinamico1!.includes(txt))
					||
					(historiaDbReal.dinamico2 != "" && historiaDbReal.dinamico2!.includes(txt))
					||
					(historiaDbReal.dinamico3 != "" && historiaDbReal.dinamico3!.includes(txt))
				);
			}

			return retorno2 || retorno3;
		}
		return false;
	}

	async accionModal(id:string, turnoTocado:ITurno|null=null, accion:string ="abrir", cancelar:string = "no") {
		const modalElement = this.modalCancelar.nativeElement;
		if (cancelar != "no") {
			this.abrirCerrarModal("cerrar",modalElement); 
		}
		else {
			if (id != "") {this.accionParaModal = id;} // esto es para el ngIf del html



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
						this.loading.mostrarSpinner();
						await this.subirHistoriaClinica();
						await this.finalizarEspecialista(this.turnoTocadoActual!, this.modalInput1);
						this.abrirCerrarModal(accion,modalElement);
						this.loading.ocultarSpinner();
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
					case 'encuesta-paciente':
					case "finalizar":
						this.abrirCerrarModal(accion,modalElement); 
						break;
				}
				
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

	async subirHistoriaClinica() {
		const turno = this.turnoTocadoActual as ITurno;
	
		const historiaClinica: IHistoriaClinica = {
			id: "",
			idPaciente: turno.pacienteId,
			idEspecialista: turno.especialistaId,
			idTurno: turno.id,
			altura: parseInt(this.formGroupHistoriaClinica.get("altura")?.value),
			peso: parseInt(this.formGroupHistoriaClinica.get("peso")?.value),
			temperatura: parseInt(this.formGroupHistoriaClinica.get("temperatura")?.value),
			presion: parseInt(this.formGroupHistoriaClinica.get("presion")?.value),
			dinamico1: this.formGroupHistoriaClinica.get("dinamico1")?.value,
			dinamico2: this.formGroupHistoriaClinica.get("dinamico2")?.value,
			dinamico3: this.formGroupHistoriaClinica.get("dinamico3")?.value,
		}

		await this.historiasClinicasService.Alta(historiaClinica);
		console.log(historiaClinica);
	}

	obtenerMensajeError(campo: string, formGroup:string){
        let control:any = "";
        if (formGroup == "historia"){control = this.formGroupHistoriaClinica.get(campo);}
        // else if (formGroup == "paciente"){control = this.formPaciente.get(campo);}
        // else if (formGroup == "especialista"){ control = this.formEspecialista.get(campo);}

        if (control?.errors) {
          if (control.errors['required']) {
            return  "'"+campo +"'" + ' es obligatorio.';
          } else if (control.errors['minlength']) {
            return `Cantidad de caracteres inválida (mínimo ${control.errors['minlength'].requiredLength}).`;
          } else if (control.errors['maxlength']) {
            return `Cantidad de caracteres inválida (máximo ${control.errors['maxlength'].requiredLength}).`;
          } else if (control.errors['pattern']) {
			if (campo == "dinamico1" || campo == "dinamico2" || campo == "dinamico3") {
				return 'El formato no es válido. Deberia ser "xxx,xxx" (key value separado por ",")';
			} else {
				return 'El formato no es válido. Deberia ser numérico entero';
			}
            
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
}
