import { Component, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { EspecialistasService } from '../../servicios/especialistas.service';
import { Subscription } from 'rxjs';
import { IEspecialista, ITurno } from '../../interfaces/interfaces';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { HorariosService } from '../../servicios/horarios.service';
import { IHorariosEspecialista } from '../../interfaces/interfaces';
import { AlertService } from '../../servicios/alert.service';

@Component({
  selector: 'app-alta-turno',
  standalone: true,
  imports: [BtnDirective],
  templateUrl: './alta-turno.component.html',
  styleUrl: './alta-turno.component.css'
})
export class AltaTurnoComponent {
	auth = inject(AuthService);
	especialistasService = inject(EspecialistasService);
	alertaService = inject (AlertService);
	subscription: Subscription;
	arrayEspecialistas: IEspecialista[] = [];
	arrayEspecialidades: string[] = [];
	loading = inject(LoadingService);
	horariosService = inject(HorariosService);
	especialidadSelected: boolean = false;
	especialistaSelected: boolean = false;
	indiceEspecialistaSelected: number = -1; // para traer con su id los horarios
	fechaSelected: boolean = false;
	horariosDisponibles: any[] = [];
	turno: ITurno = {
		id : "",
		especialidad : "",
		especialistaId : "",
		horario: new Date(),
		pacienteId: "",
		estado: "",
		cancelado_especialista: "",
		cancelado_paciente: "",
		completado_especialista: "",
		completado_paciente_encuesta: "",
		completado_paciente_atencion: "",
	}

	constructor(){
		this.loading.mostrarSpinner();
		this.subscription =	this.especialistasService.GetEspecialistas().subscribe(
			{
                next: (rta: any[]) => {
                    console.log(rta);  
                    this.arrayEspecialistas = [];
					this.arrayEspecialidades = [];

                    rta.forEach((element) => {
                        this.arrayEspecialistas.push(
							{
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
								especialidad: element.especialidad
							}
                            
                        );
                    });
					for (let i=0; i<this.arrayEspecialistas.length; i++)
					{
						for (let j=0; j<this.arrayEspecialistas[i].especialidad.length; j++)
						{
							this.arrayEspecialidades.push(this.arrayEspecialistas[i].especialidad[j]);
						}
					}

					console.log(this.arrayEspecialidades);
					this.arrayEspecialidades = Array.from(new Set(this.arrayEspecialidades))
					console.log("ESPECIALIDADES SET");
					console.log(this.arrayEspecialidades);

					this.subscription.unsubscribe();
					this.loading.ocultarSpinner();
                },
                error: (err: any) => {
                    console.log('Error ->', (err as Error).message);
					this.loading.ocultarSpinner();
                },
				complete: () => {
					this.subscription.unsubscribe();
					this.loading.ocultarSpinner();
				}
            }
		)
	
	}

	solicitarEspecilidad(selected: string) {
		this.especialidadSelected = true;
		this.turno.especialidad = selected 
	}

	mostrarEspecialistas(especialidadSeleccionada:string)
	{
		let arrayEspecialistasValidos : IEspecialista[] = [];
		let validoActual = false;
		for (let i=0; i<this.arrayEspecialistas.length; i++) // todos los especialistas
		{ 
			validoActual = false;
			for (let j=0; j<this.arrayEspecialistas[i].especialidad.length; j++) // las especialidades del especialista
			{
				if (this.arrayEspecialistas[i].especialidad[j] == especialidadSeleccionada)
				{
					validoActual = true;
					break;
				}
			}
			if (validoActual) {arrayEspecialistasValidos.push(this.arrayEspecialistas[i])}
		}
		return arrayEspecialistasValidos;
	}
	
	solicitarEspecilista(selected: string) {
		this.especialistaSelected = true;
		this.turno.especialistaId = selected 
		this.traerFechasDisponibles();
	}

	async traerFechasDisponibles()
	{
		try
		{
			this.loading.mostrarSpinner();

			const fechasEspecialista = await this.horariosService.GetHorario(this.turno.especialistaId);
			const horariosDisponibles: IHorariosEspecialista = fechasEspecialista.docs[0].data() as IHorariosEspecialista;
			console.log(horariosDisponibles);
			this.mostrarFechasDisponibles(horariosDisponibles);
		}
		catch (e:any)
		{
			this.alertaService.Alerta("Lo siento...", "El especialista seleccionado no tiene horarios disponibles en los proximos 15 dias... Intente con otro", "warning", true, "/bienvenida");
		}
		finally{
			this.loading.ocultarSpinner();
		}
	}

	mostrarFechasDisponibles(horarios: IHorariosEspecialista) {
		const resultado: any = {
			lunes: { fechas: [] },
			martes: { fechas: [] },
			miercoles: { fechas: [] },
			jueves: { fechas: [] },
			viernes: { fechas: [] },
			sabado: { fechas: [] },
		};
		const diasDeSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
		const hoy = new Date();
	
		// Generar fechas para los próximos 15 días, agrupándolas en `resultado`
		for (let i = 0; i <= 15; i++) {
			const diaActual = new Date(hoy);
			diaActual.setDate(hoy.getDate() + i);
			const diaIndice = diaActual.getDay();
			const dia = diasDeSemana[diaIndice];
			
			if (dia !== "domingo") {
				resultado[dia].fechas.push(diaActual);
			}
		}
	
		// Crear un array `fechasDisponibles` con las fechas y horarios específicos del especialista
		const fechasDisponibles = [];
	
		// Iterar sobre los días de la semana
		for (const dia in resultado) {
			const diaKey = dia as keyof IHorariosEspecialista;
	
			// Solo agregar fechas si el especialista tiene disponibilidad en ese día
			if (horarios[diaKey] && horarios[diaKey].length > 0) {
				for (const fecha of resultado[dia].fechas) {
					// Obtener el nombre del día para mostrarlo junto a la fecha
					const diaNombre = diasDeSemana[fecha.getDay()];
					
					// Agregar la fecha en el formato deseado
					fechasDisponibles.push({
						fecha: `${fecha.toISOString().split('T')[0]} (${diaNombre})`, // Convertir fecha a formato 'YYYY-MM-DD'
						horarios: horarios[diaKey] // Agregar los horarios correspondientes
					});
				}
			}
		}
	
		// Ordenar las fechas de `fechasDisponibles`
		fechasDisponibles.sort((a, b) => new Date(a.fecha.split(' ')[0]).getTime() - new Date(b.fecha.split(' ')[0]).getTime());
	
		this.horariosDisponibles = fechasDisponibles;
		console.log(this.horariosDisponibles);
		return fechasDisponibles;
	}
	
	

	ngOnDestroy(): void {

		if (this.subscription) { this.subscription.unsubscribe(); }
	}
}
