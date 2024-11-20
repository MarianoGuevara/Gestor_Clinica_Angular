import { Component, inject, ViewChild, ElementRef  } from '@angular/core';
import { GraficoGenericoComponent } from "../grafico-generico/grafico-generico.component";
import { AlertService } from '../../servicios/alert.service';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { AuthService } from '../../servicios/auth.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LogsService } from '../../servicios/logs.service';
import { IEspecialista, ILog, ITurno } from '../../interfaces/interfaces';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { TurnosService } from '../../servicios/turnos.service';
import { EspecialistasService } from '../../servicios/especialistas.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
	GraficoGenericoComponent,
	BtnDirective,
	FechaPipe,
	FormsModule 
  ],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})



export class EstadisticasComponent {
	logs = inject(LogsService);
	auth = inject(AuthService)
	loading = inject(LoadingService);
	logsReales: ILog[] = [];
	turnosService = inject(TurnosService);
	especialistasService = inject(EspecialistasService);
	labelsEspecialidad: any = []
	seriesEspecialidad: any = []
	dateTurnosPorDia: string = "";
	labelsTurnosDia: any = []
	seriesTurnosDia: any = []
	especialistas: IEspecialista[] = []
	dateTurnosSolicitadoMedico: string = "";
	dateTurnosFinalizadoMedico: string = "";
	especialistaTurnosSolicitadoMedico: IEspecialista|null = null;
	especialistaTurnosFinalizadoMedico: IEspecialista|null = null;
	labelsTurnosSolicitadoMedico: any = []
	seriesTurnosSolicitadoMedico: any = []
	labelsTurnosFinalizadoMedico: any = []
	seriesTurnosFinalizadoMedico: any = []

	constructor() {}

	async ngOnInit(){
		this.loading.mostrarSpinner();

		await this.generarEstadisticaLogs();
		await this.generarTurnosPorEspecialidad();
		await this.traerEspecialistas();


		this.loading.ocultarSpinner();
	}

	async traerEspecialistas() {
		const especialistasDb = await this.especialistasService.GetEspecialistasNormal();
		for (let i=0; i<especialistasDb.docs.length; i++) {
			const especialistaActual = especialistasDb.docs[i].data() as IEspecialista
			this.especialistas.push(especialistaActual);
		}
	}

	generarPDF(graficoId:string, nombre:string) {
		const elemento = document.getElementById(graficoId) as HTMLElement;

		html2canvas(elemento, { scale: 2 }).then((canvas) => {
			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF('p', 'mm', 'a4');
			
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
			
			pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
			
			pdf.save(this.auth.usuarioRealActual?.apellido+"-"+nombre+'-grafico.pdf');
		}); 	
		
	}
	
	async generarEstadisticaLogs() 
	{
		const logsDb = await this.logs.GetLogs();

		for (let i=0; i<logsDb.docs.length; i++) {	
			this.logsReales.push(logsDb.docs[i].data() as ILog);
		}
	}

	async generarTurnosPorEspecialidad() {
		
		const turnosDb = await this.turnosService.GetTurnosNormal();
		const especialistasDb = await this.especialistasService.GetEspecialistasNormal();

		let arrayEspecialidades = []
		for (let i=0; i<especialistasDb.docs.length; i++) {
			const especialistaActual = especialistasDb.docs[i].data() as IEspecialista
			for (let j=0; j<especialistaActual.especialidad.length; j++) {
				arrayEspecialidades.push(especialistaActual.especialidad[j]);
			}
		}
		const especialidadesSet = [...new Set(arrayEspecialidades)]

		let especialidadesCant = []
		for (let i=0; i<especialidadesSet.length; i++) {
			especialidadesCant.push(0);
		}
		// hasta aca tengo array set de especialidades y indices paralelos en 0

		if (turnosDb.docs){
			for (let i=0; i<turnosDb.docs.length; i++) {
				const turnoActual = turnosDb.docs[i].data() as ITurno;
	
				for (let j=0; j<especialidadesSet.length; j++) {
					if (turnoActual.especialidad == especialidadesSet[j]) {
						especialidadesCant[j] += 1;
					}
				}
			}
		}
		

		this.labelsEspecialidad = especialidadesSet;
		this.seriesEspecialidad = [{name:'', data:especialidadesCant}]
	}

	
	async turnosPorDia() {
		this.loading.mostrarSpinner();

		const arrayFechasHastaHoy = this.generarDiasDesdeFecha(this.dateTurnosPorDia);
		let arrayCantTurnosDia = []
		for (let i=0; i<arrayFechasHastaHoy.length; i++) {
			arrayCantTurnosDia.push(0);
		}

		for (let i=0; i<arrayFechasHastaHoy.length; i++) {
			const turnosDb = await this.turnosService.GetTurnosDia(arrayFechasHastaHoy[i])
			arrayCantTurnosDia[i] = turnosDb.docs.length;
		}

		for (let i=0; i<arrayFechasHastaHoy.length; i++) {	
			arrayFechasHastaHoy[i] = arrayFechasHastaHoy[i].split(' (')[0];
		}

		this.labelsTurnosDia = arrayFechasHastaHoy
		this.seriesTurnosDia = [{name:'', data:arrayCantTurnosDia}]
		console.log(this.labelsTurnosDia);
		console.log(this.seriesEspecialidad);

		this.loading.ocultarSpinner();
	}

	async turnosPorMedico(tipoClick:string, especialista:IEspecialista|null=null, solicitado:boolean=true) {
		this.loading.mostrarSpinner();
		if (tipoClick == "especialista" && solicitado) {
			this.especialistaTurnosSolicitadoMedico = especialista;
		} else if (tipoClick == "especialista" && !solicitado){
			this.especialistaTurnosFinalizadoMedico = especialista;
		}

		const condicion = solicitado && this.dateTurnosSolicitadoMedico != "";
		const condicion2 = !solicitado && this.dateTurnosFinalizadoMedico != "";

		const condicionSolicitado = (
			this.especialistaTurnosSolicitadoMedico != null && this.dateTurnosSolicitadoMedico != ""
		);

		const condicionSolicitadoNot = (
			this.especialistaTurnosFinalizadoMedico != null && this.dateTurnosFinalizadoMedico != ""
		);

		if ((solicitado && condicionSolicitado) || (!solicitado && condicionSolicitadoNot)) {
			console.log("entre")
			let arrayFechasHastaHoy:any = []
			if (solicitado) {
				arrayFechasHastaHoy = this.generarDiasDesdeFecha(this.dateTurnosSolicitadoMedico);
				
			} else {
				arrayFechasHastaHoy = this.generarDiasDesdeFecha(this.dateTurnosFinalizadoMedico);
			}
			let arrayCantTurnosSoliMedico = []
				for (let i=0; i<arrayFechasHastaHoy.length; i++) {
					arrayCantTurnosSoliMedico.push(0);
				}
			

			for (let i=0; i<arrayFechasHastaHoy.length; i++) {
	
				let turnosDb:any = []
				if (solicitado && this.especialistaTurnosSolicitadoMedico != null) {
					turnosDb = await this.turnosService.GetTurnosSolicitadosEspecialistaFecha(this.especialistaTurnosSolicitadoMedico.id, arrayFechasHastaHoy[i]);
				} else if (!solicitado && this.especialistaTurnosFinalizadoMedico != null){
					turnosDb = await this.turnosService.GetTurnosFinalizadosEspecialistaFecha(this.especialistaTurnosFinalizadoMedico.id, arrayFechasHastaHoy[i]);
				}

				console.log(turnosDb.docs);
				arrayCantTurnosSoliMedico[i] = turnosDb.docs.length;
			}


			for (let i=0; i<arrayFechasHastaHoy.length; i++) {	
				arrayFechasHastaHoy[i] = arrayFechasHastaHoy[i].split(' (')[0];
			}


			if (solicitado) {
				this.labelsTurnosSolicitadoMedico = arrayFechasHastaHoy;
				this.seriesTurnosSolicitadoMedico = arrayCantTurnosSoliMedico;
			} else {
				this.labelsTurnosFinalizadoMedico = arrayFechasHastaHoy;
				this.seriesTurnosFinalizadoMedico = arrayCantTurnosSoliMedico;
			}
	
			console.log(this.labelsTurnosSolicitadoMedico);
			console.log(this.seriesTurnosSolicitadoMedico);
		}
	
		this.loading.ocultarSpinner();
	}


	



	generarDiasDesdeFecha(fechaInicial: string): string[] {
		const [anio, mes, dia] = fechaInicial.split('-').map(Number); // Desglosa "YYYY-MM-DD"
		const fechaInicio = new Date(anio, mes - 1, dia); // Crea la fecha local correctamente
		const fechaHoy = new Date();
	
		// Normalizar ambas fechas a medianoche (eliminar horas, minutos y segundos)
		fechaInicio.setHours(0, 0, 0, 0);
		fechaHoy.setHours(0, 0, 0, 0);
	
		const diasArray: string[] = [];
	
		// Bucle para incluir todos los días desde fechaInicio hasta fechaHoy
		while (fechaInicio <= fechaHoy) {
			// Formatear la fecha en "YYYY-MM-DD"
			const dia = fechaInicio.getDate().toString().padStart(2, '0');
			const mes = (fechaInicio.getMonth() + 1).toString().padStart(2, '0'); // Meses comienzan desde 0
			const anio = fechaInicio.getFullYear();
			const final = this.agregarDiaSemana(`${anio}-${mes}-${dia}`);
			diasArray.push(final);
	
			// Incrementar un día
			fechaInicio.setDate(fechaInicio.getDate() + 1);
		}
	
		return diasArray;
	}
	
	
	agregarDiaSemana(fecha: string): string {
		const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
		const [year, month, day] = fecha.split("-").map(Number);
	
		const fechaObj = new Date(year, month - 1, day); // Crear objeto Date
		const diaSemana = diasSemana[fechaObj.getDay()]; // Obtener el día de la semana
	
		return `${fecha} (${diaSemana})`; // Formato esperado en Firebase
	}
}
