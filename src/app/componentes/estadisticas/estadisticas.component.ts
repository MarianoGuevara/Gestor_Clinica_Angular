import { Component, inject, ViewChild, ElementRef  } from '@angular/core';
import { GraficoGenericoComponent } from "../grafico-generico/grafico-generico.component";
import { AlertService } from '../../servicios/alert.service';
import { LoadingService } from '../../servicios/loading.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { AuthService } from '../../servicios/auth.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LogsService } from '../../servicios/logs.service';


@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
	GraficoGenericoComponent,
	BtnDirective
  ],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent {
	logs = inject(LogsService);
	auth = inject(AuthService)
	loading = inject(LoadingService);

	constructor() {}

	async ngOnInit(){
		const docs = await this.logs.GetLogs()
		console.log(docs);
		console.log(docs.docs[0].data()["fecha"]);
	}

	generarPDF(graficoId:string) {
		const elemento = document.getElementById(graficoId) as HTMLElement;
		html2canvas(elemento, { scale: 2 }).then((canvas) => {
			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF('p', 'mm', 'a4');
			
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
			
			pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
			pdf.text("HOLA ESTE ES EL TEXTO", 10, pdfHeight + 10);
			
			pdf.save(this.auth.usuarioRealActual?.apellido+'-grafico.pdf');
		});
	}
	
}
