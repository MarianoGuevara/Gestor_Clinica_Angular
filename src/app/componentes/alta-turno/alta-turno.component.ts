import { Component, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { EspecialistasService } from '../../servicios/especialistas.service';
import { Subscription } from 'rxjs';
import { IEspecialidad, IEspecialista, IPaciente, ITurno } from '../../interfaces/interfaces';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { HorariosService } from '../../servicios/horarios.service';
import { IHorariosEspecialista } from '../../interfaces/interfaces';
import { AlertService } from '../../servicios/alert.service';
import { PacientesService } from '../../servicios/pacientes.service';
import { TurnosService } from '../../servicios/turnos.service';
import { Router } from '@angular/router';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { DisplayDirective } from '../../directivas/display.directive';

@Component({
  selector: 'app-alta-turno',
  standalone: true,
  imports: [
	BtnDirective,
	FechaPipe,
	DisplayDirective
  ],
  templateUrl: './alta-turno.component.html',
  styleUrl: './alta-turno.component.css'
})
export class AltaTurnoComponent {
	auth = inject(AuthService);
	pacientesService = inject(PacientesService);
	especialistasService = inject(EspecialistasService);
	alertaService = inject (AlertService);
	turnosService = inject(TurnosService);
	subscription: Subscription;
	subscription2: Subscription|null = null;
	arrayPacientes: IPaciente[] = [];
	arrayEspecialistas: IEspecialista[] = [];
	arrayEspecialidadesValidas: IEspecialidad[] = [];
	especialistaNombre: string = "";
	especialistaApellido: string = "";
	loading = inject(LoadingService);
	horariosService = inject(HorariosService);
	pacienteSeleccionado: boolean = false;
	especialidadSelected: boolean = false;
	especialistaSelected: boolean = false;
	indiceEspecialistaSelected: number = -1; // para traer con su id los horarios
	fechaSelected: boolean = false;
	horariosDisponibles: any[] = []; // guardo en atributo lo q me va a devolver el metodo pq es mas easy
	turno: ITurno = {
		id : "",
		especialidad : "",
		especialistaId : "",
		especialistaNombreApellido : "",
		fecha: "",
		horario: "",
		pacienteId: "",
		pacienteNombreApellido : "",
		estado: "",
		rechazado_especialista: "",
		cancelado_especialista: "",
		cancelado_paciente: "",
		cancelado_administrador: "",
		completado_especialista: "",
		completado_paciente_encuesta: "",
		completado_paciente_atencion: "",
	}
	horariosVisibles: boolean[] = [];
	router = inject(Router);

	constructor(){
		this.loading.mostrarSpinner();
		this.subscription =	this.especialistasService.GetEspecialistas().subscribe(
			{
                next: (rta: any[]) => {
                    console.log(rta);  
                    this.arrayEspecialistas = [];

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

					// ESTO ME CONSIGUE TODAS LAS ESPECIALIDADES... YA NO LO NECESITO PERO X LAS DUDAS...
					// for (let i=0; i<this.arrayEspecialistas.length; i++)
					// {
					// 	for (let j=0; j<this.arrayEspecialistas[i].especialidad.length; j++)
					// 	{
					// 		this.arrayEspecialidades.push(this.arrayEspecialistas[i].especialidad[j]);
					// 	}
					// }

					// console.log(this.arrayEspecialidades);
					// this.arrayEspecialidades = Array.from(new Set(this.arrayEspecialidades))
					// console.log("ESPECIALIDADES SET");
					// console.log(this.arrayEspecialidades);

					this.subscription.unsubscribe();
					this.loading.ocultarSpinner();
                },
                error: (err: any) => {
                    console.log('Error ->', (err as Error).message);
					this.loading.ocultarSpinner();
                },
				complete: () => {
					// this.subscription.unsubscribe();
					this.loading.ocultarSpinner();
				}
            }
		)

		this.traerPacientes();
	}

	traerPacientes()
	{
		this.loading.mostrarSpinner();
		this.subscription2 = this.pacientesService.GetPacientes().subscribe({
			next: (rta: any[]) => {
				console.log(rta);  
				this.arrayPacientes = [];

				rta.forEach((element) => {
					this.arrayPacientes.push(
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
							imagenPerfil2: element.imagenPerfil2,
							obraSocial: element.obraSocial
						}	
					);
				});
			
				
				this.subscription2?.unsubscribe();
				this.loading.ocultarSpinner();
			},
			error: (err: any) => {
				console.log('Error ->', (err as Error).message);
				this.loading.ocultarSpinner();
			},
			complete: () => {
				// this.subscription2?.unsubscribe();
				this.loading.ocultarSpinner();
			}
		})
	}

	solicitarPaciente(paciente: IPaciente)
	{
		this.pacienteSeleccionado = true;
		this.turno.pacienteId = paciente.id;
		this.turno.pacienteNombreApellido = paciente.nombre + " " + paciente.apellido;
	}

	seleccionarEspecialidad(especialidad: IEspecialidad) {
		console.log(especialidad);
		this.especialidadSelected = true;
		this.turno.especialidad = especialidad.nombre 
		if (this.auth.usuarioRealActual?.rol != "administrador") {
			this.turno.pacienteId = this.auth.usuarioRealActual?.id || "";
			this.turno.pacienteNombreApellido = this.auth.usuarioRealActual?.nombre + " " + this.auth.usuarioRealActual?.apellido;
		}
		this.traerFechasDisponibles();
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
	
	async solicitarEspecilista(id: string, nombre:string, apellido:string) {
		this.loading.mostrarSpinner();
		this.especialistaSelected = true;
		this.turno.especialistaId = id;
		this.turno.especialistaNombreApellido = nombre + " " + apellido;


		const especialidadesValidas = await this.traerEspecialidades(nombre,apellido);

		this.arrayEspecialidadesValidas = [];
		especialidadesValidas.forEach(async (especialidad) => {
			const especialidadActualDb = await this.especialistasService.obtenerEspecialidadDetalles(especialidad);
			const especialidadActual = especialidadActualDb.docs[0].data() as IEspecialidad;
			this.arrayEspecialidadesValidas.push(especialidadActual);
		})
		this.loading.ocultarSpinner();
		// this.traerFechasDisponibles();
	}

	async traerEspecialidades(nombreEspecialista:string, apellidoEspecialista:string) {
		const especialistaDb = await this.especialistasService.GetEspecialistaNombreApellido(nombreEspecialista,apellidoEspecialista);
		const especialista = especialistaDb.docs[0].data() as IEspecialista; 

		return especialista.especialidad;
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

	async mostrarFechasDisponibles(horarios: IHorariosEspecialista) {
		this.loading.mostrarSpinner();
		// horarios disponibles es el array con -> dia : ["8:00", "8:30"] etc del especialista
		const resultado: any = {
			lunes: { fechas: [] },
			martes: { fechas: [] },
			miercoles: { fechas: [] },
			jueves: { fechas: [] },
			viernes: { fechas: [] },
			sabado: { fechas: [] },
		}; // me creo un objeto con los dias validos como key y como velue objetos con key fecha y value array

		
		const diasDeSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
		const hoy = new Date(); // objeto date con la fecha de hoy
	
		for (let i = 0; i <= 15; i++) {
			const diaActual = new Date(hoy);
			diaActual.setDate(hoy.getDate() + i); // obtiene la fecha de hoy... primero va a ser la de hoy y + 1 dia x iteracion
			const diaIndice = diaActual.getDay();
			const dia = diasDeSemana[diaIndice]; // de dia llama al indice correspondiente; 0 == domingo; 1 == lunes... etc
							
			if (dia !== "domingo") {
				resultado[dia].fechas.push(diaActual);
				// entonces a mi objeto inicializado arriba en el dia correspondiente appendeo en el array 
				// de fechas dia actual que seria el dia de la fecha en tipo date
			}
		}
		// aca resultado sera un objeto que tendra los dias disponibles de aca a 15 dias
		// x ej... : lunes : {fechas: [] } -> y dentro de [] habra un objeto date q represente 1 dia x ejemplo el 
		// 1/10 y dsps como 2do indice el 8/10 (+7 dias) entonces quedaran las fechas validas de aca a 15 dias
	
		const fechasDisponibles = [];
	
		// Iterar sobre los días de la semana
		for (const dia in resultado) {
			const diaKey = dia as keyof IHorariosEspecialista;
			// tranforma dia que seria el key domingo,lunes,martes de mi objeto inicial 
			// para q el interprete lo trate como una key de IHorariosEspecialista (seria el key q representa al array de cada dia)

			// si el array del dia actual existe y tiene mas de 0 indice...
			if (horarios[diaKey] && horarios[diaKey].length > 0) {
				for (const fecha of resultado[dia].fechas) {
					// fecha sera el array fechas: [] del dia especifico (dia == diaKey). Cada indice tipo Date eeh

					const diaNombre = diasDeSemana[fecha.getDay()]; // obtiene en string el dia de la semana actual del recorrido for
					
					// Agregar la fecha en el formato deseado
					fechasDisponibles.push(
					{
						fecha: `${fecha.toISOString().split('T')[0]} (${diaNombre})`, // Convertir fecha a formato 'YYYY-MM-DD' y el nombre del dia en criollo
						horarios: horarios[diaKey] // Agregar los horarios correspondientes del especialista
					});
				}
				// al terminar el bucle mi fechasDisponibles será un array con 15 objetos q representan 1 dia cada uno 
				// los cuales tendran el key fecha q es un string y horarios string q sera el mismo array segun el dia disponible del especialista
			}
		}
	
		// Ordenar las fechas de `fechasDisponibles` para q muestre la de hoy primero
		fechasDisponibles.sort((a, b) => new Date(a.fecha.split(' ')[0]).getTime() - new Date(b.fecha.split(' ')[0]).getTime());
	
		this.horariosDisponibles = fechasDisponibles;
		console.log("HORARIOS DISPONIBLES -> ", this.horariosDisponibles);

		const rta = await this.obtenerTurnosEspecialistaOcupado(this.turno.especialistaId);
		console.log(rta);
		this.extraerTurnosEspecificos(this.horariosDisponibles, rta);
		console.log("HORARIOS DISPONIBLES LAST-> ", this.horariosDisponibles);

		this.horariosVisibles = new Array(this.horariosDisponibles.length).fill(false); // array de booleanos

		this.loading.ocultarSpinner();
		return fechasDisponibles;
	}
	
	seleccionarDia(index: number): void {
		console.log(index);
        this.horariosVisibles[index] = !this.horariosVisibles[index];
    }

	async seleccionarHorario(index:number, fecha:string, horario:string)
	{
		console.log(this.horariosDisponibles);
		console.log(index);
		console.log(fecha);
		console.log(horario);
		this.loading.mostrarSpinner();
		this.fechaSelected = true;
		this.turno.fecha = fecha;
		this.turno.horario = horario;
		this.turno.estado = "Pendiente de aprobacion";

		const turnoDisponibleEndDb = await this.turnosService.GetTurnosHorario(horario, fecha);
		try {
			const turnoDisponibleEndReal = turnoDisponibleEndDb.docs[0].data() as ITurno;
			
			this.alertaService.Alerta("Fracaso en el alta", "El horario del turno ya esta ocupado", 'error').then(()=>{
				this.loading.ocultarSpinner();
				this.router.navigate(["/bienvenida"]);
			})
		} catch {
			this.turnosService.Alta(this.turno)
				.then((rta) => {
					this.turno.id = rta;

				 	// SACAR AL ARRAY DE DISPONIBLES EN PROX TURNO EL HORARIO EXACTO DEL DIA Y FECHA DE ESTE TURNO (NO DIA EN GENERAL SINOO EL ESPECIFICO)
				 	// HABRIA Q TRAER CON GET LOS TURNOS DEL ESPECIALISTA Y ELIMINAR DE TURNOS DISPONIBLES DEL DIA ESPECIFICO EL TURNO EXACTO
		

					this.alertaService.Alerta("El turno fue pedido con exito", "Truno exitoso", 'success').then(()=>{
						this.loading.ocultarSpinner();
						this.router.navigate(["/bienvenida"]);
					})
				})
				.catch((error) => {
					this.alertaService.Alerta("Fracaso en el alta", error.message, 'error');
				})
				console.log(this.turno);
		}	
	}

	async obtenerTurnosEspecialistaOcupado(especialistaId:string){

		const turnos = await this.turnosService.GetTurnosEspecialistaId(especialistaId);
		const arrayTurnos = turnos.docs;
		let arrayRetornoTurnos: any[] = [];
		for (let i=0; i<arrayTurnos.length; i++)
		{	
			arrayRetornoTurnos.push({
				fecha : arrayTurnos[i].data()["fecha"],
				horario : arrayTurnos[i].data()["horario"],
			})
		}
		return arrayRetornoTurnos;
	}

	extraerTurnosEspecificos(arrayDisponibilidad:any[], arrayTurnosEspecificos:any[]) {
		for (let i=0; i<arrayDisponibilidad.length; i++) {
			for (let j=0; j<arrayTurnosEspecificos.length; j++) {
				if (arrayDisponibilidad[i].fecha == arrayTurnosEspecificos[j].fecha) {
					for (let k=0; k<arrayDisponibilidad[i].horarios.length; k++) {
						if (arrayDisponibilidad[i].horarios[k] == arrayTurnosEspecificos[j].horario) {
							console.log("BORRANDING");
							arrayDisponibilidad[i].horarios.splice(k,1);
						}
					}
				}
			}
		}
	}

	devolverASeleccionPaciente() {
		if (this.auth.usuarioRealActual?.rol == 'administrador') {
			this.pacienteSeleccionado = false;
			
		}
	}
	devolverASeleccionEspecialista() {
		this.especialistaSelected = false;
	}
	devolverASeleccionEspecialidad() {
		this.especialidadSelected = false;
	}

	ngOnDestroy(): void {

		if (this.subscription) { this.subscription.unsubscribe(); }
		if (this.subscription2) { this.subscription2.unsubscribe(); }
	}
}
