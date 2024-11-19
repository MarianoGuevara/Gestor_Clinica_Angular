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


@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
	GraficoGenericoComponent,
	BtnDirective,
	FechaPipe
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


	constructor() {}

	async ngOnInit(){
		this.loading.mostrarSpinner();

		await this.generarEstadisticaLogs();
		await this.generarTurnosPorEspecialidad();

		this.loading.ocultarSpinner();
	}

	generarPDF(graficoId:string) {
		const elemento = document.getElementById(graficoId) as HTMLElement;

		html2canvas(elemento, { scale: 2 }).then((canvas) => {
			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF('p', 'mm', 'a4');
			
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
			
			pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
			
			pdf.save(this.auth.usuarioRealActual?.apellido+'-grafico.pdf');
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
}
