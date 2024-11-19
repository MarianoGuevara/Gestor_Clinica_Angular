import { Component, inject } from '@angular/core';
import { LoadingService } from '../../servicios/loading.service';
import { AuthService } from '../../servicios/auth.service';
import { Subscription } from 'rxjs';
import { BtnDirective } from '../../directivas/btn.directive';
import { HistoriaClinicaService } from '../../servicios/historia-clinica.service';
import { IEspecialista, IHistoriaClinica, IPaciente, ITurno } from '../../interfaces/interfaces';
import { EspecialistasService } from '../../servicios/especialistas.service';
import { PacientesService } from '../../servicios/pacientes.service';
import { TurnosService } from '../../servicios/turnos.service';
import jsPDF from 'jspdf';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { FormatearEstadoTurnoPipe } from '../../pipes/formatear-estado-turno.pipe';

interface LocalHistoriaClinicaCard {
	especialistaNombre: string;
	pacienteNombre: string;
	especialidad: string;
	fecha: string;
	horario: string;
	altura: string;
	peso: string;
	temperatura: string;
	presion: string;
	dinamico1?: string;
	dinamico2?: string;
	dinamico3?: string;
	id_historia:string; // para pdf
}

@Component({
  selector: 'app-listado-hisotrias-clinicas',
  standalone: true,
  imports: [BtnDirective,FechaPipe, FormatearEstadoTurnoPipe],
  templateUrl: './listado-hisotrias-clinicas.component.html',
  styleUrl: './listado-hisotrias-clinicas.component.css'
})
export class ListadoHisotriasClinicasComponent {
	loading = inject(LoadingService);
	auth = inject(AuthService);
	historiasClinicasService = inject(HistoriaClinicaService);
	especialistasService = inject(EspecialistasService);
	pacientesService = inject(PacientesService);
	turnosService = inject(TurnosService);
	suscripcion: Subscription|null = null;
	historiasClinicasFiltradas: IHistoriaClinica[] = []; // historias segun sea especialista paciente etc
	cardsHistoriaClinicas: LocalHistoriaClinicaCard[] = []; // de las historias, la info q aparecerá en pantalla. Interfaz local del componente
	cardsTurnos: ITurno[] = []; 
	pacienteSeleccionado: IPaciente | null = null;
	pacientes: IPaciente[] = []
	especialistas: IEspecialista[] = []

	constructor() {}

	async ngOnInit() {
		this.loading.mostrarSpinner();
		this.historiasClinicasFiltradas = [];

		if (this.auth.usuarioRealActual?.rol == "paciente") {
			const historiasDb = await this.historiasClinicasService.GetHistoriasPaciente(this.auth.usuarioRealActual.id);
			this.especialistas = await this.EspecialistasDeArray(historiasDb);
			for (let i=0; i<historiasDb.docs.length; i++) {
				this.historiasClinicasFiltradas.push(historiasDb.docs[i].data() as IHistoriaClinica);
			}
		} else if (this.auth.usuarioRealActual?.rol == "especialista") {
			const historiasDb = await this.historiasClinicasService.GetHistoriasEspecialista(this.auth.usuarioRealActual.id);
			this.pacientes = await this.PacientesDeArray(historiasDb);
		} else { 
			const historiasDb = await this.historiasClinicasService.GetHistorias();
			console.log(historiasDb.docs);
			this.pacientes = await this.PacientesDeArray(historiasDb);
		}

		if (this.auth.usuarioRealActual?.rol == "paciente") {
			this.crearContenidoCards().then(() => {
				this.loading.ocultarSpinner();
			});
		} else {
			this.loading.ocultarSpinner();
		}
	}

	async crearContenidoCards() {
		this.cardsHistoriaClinicas = [];
		for (let i=0; i<this.historiasClinicasFiltradas.length; i++) {
			// const pacienteHistoriaDb = await this.pacientesService.GetPacienteId(this.historiasClinicasFiltradas[i].idPaciente);
			// const pacienteHistoria = pacienteHistoriaDb.docs[0].data() as IPaciente;

			// const especialistaHistoriaDb = await this.especialistasService.GetEspecialistaId(this.historiasClinicasFiltradas[i].idEspecialista);
			// const especialistaHistoria = especialistaHistoriaDb.docs[0].data() as IEspecialista;

			const turnoHistoriaDb = await this.turnosService.GetTurnoId(this.historiasClinicasFiltradas[i].idTurno);
			const turnoHistoria = turnoHistoriaDb.docs[0].data() as ITurno;

			const card: LocalHistoriaClinicaCard = {
				pacienteNombre: turnoHistoria.pacienteNombreApellido,
				especialistaNombre: turnoHistoria.especialistaNombreApellido,
				especialidad: turnoHistoria.especialidad,
				fecha: turnoHistoria.fecha,
				horario: turnoHistoria.horario,
				altura: (this.historiasClinicasFiltradas[i].altura).toString() + " cm.",
				peso: (this.historiasClinicasFiltradas[i].peso).toString() + " kg.",
				temperatura: (this.historiasClinicasFiltradas[i].temperatura).toString() + " grados",
				presion: (this.historiasClinicasFiltradas[i].presion).toString() + " de presion",
				dinamico1: this.historiasClinicasFiltradas[i].dinamico1,
				dinamico2: this.historiasClinicasFiltradas[i].dinamico2,
				dinamico3: this.historiasClinicasFiltradas[i].dinamico3,
				id_historia: this.historiasClinicasFiltradas[i].id
			}

			this.cardsHistoriaClinicas.push(card);
		}
	}

	// sobre un array de historias clinicas te crea otro de pacientes sin repetir
	async PacientesDeArray(historiasDb:any) { 
		let pacientesTodos: any[] = [];
		for (let i=0; i<historiasDb.docs.length; i++) {
			const historiaActual = historiasDb.docs[i].data() as IHistoriaClinica;

			const pacienteActual = await this.pacientesService.GetPacienteId(historiaActual.idPaciente);
			pacientesTodos.push(pacienteActual.docs[0].data() as IPaciente)

			this.historiasClinicasFiltradas.push(historiasDb.docs[i].data() as IHistoriaClinica);
		}

		pacientesTodos = pacientesTodos.filter((paciente, index, self) => 
			index === self.findIndex((u) => u.id === paciente.id) // filtra x id
		);

		return pacientesTodos;
	}

	async EspecialistasDeArray(historiasDb:any) { 
		let especialistasTodos: any[] = [];
		for (let i=0; i<historiasDb.docs.length; i++) {
			const historiaActual = historiasDb.docs[i].data() as IHistoriaClinica;

			const especialistaActual = await this.especialistasService.GetEspecialistaId(historiaActual.idEspecialista);
			especialistasTodos.push(especialistaActual.docs[0].data() as IEspecialista)
		}

		especialistasTodos = especialistasTodos.filter((especialista, index, self) => 
			index === self.findIndex((u) => u.id === especialista.id) // filtra x id
		);

		return especialistasTodos;
	}




	async generarCardsEspecificas(idPaciente:string) {
		this.loading.mostrarSpinner();

		let historiasDePacientesEspecificosDb:any = null;

		if (this.auth.usuarioRealActual?.rol == "administrador") {
			historiasDePacientesEspecificosDb = await this.historiasClinicasService.GetHistoriasPaciente(idPaciente);
		} else {
			historiasDePacientesEspecificosDb = await this.historiasClinicasService.GetHistoriasPacienteEspecialista(idPaciente, this.auth.usuarioRealActual?.id!);
			
			this.cardsTurnos = []
			for (let i=0; i<historiasDePacientesEspecificosDb.docs.length; i++) {
				const historiaActual = historiasDePacientesEspecificosDb.docs[i].data() as IHistoriaClinica;
	
				const turnoActualDb = await this.turnosService.GetTurnoId(historiaActual.idTurno);
				const turnoActual = turnoActualDb.docs[0].data() as ITurno;
				this.cardsTurnos.push(turnoActual);
			}
		}
		
		this.historiasClinicasFiltradas = []
		for (let i=0; i<historiasDePacientesEspecificosDb.docs.length; i++) {
			this.historiasClinicasFiltradas.push(historiasDePacientesEspecificosDb.docs[i].data() as IHistoriaClinica);
		}

		await this.crearContenidoCards();
		this.loading.ocultarSpinner();
	}


	async pdf(idhistoria: string) {
		const historiaDb = await this.historiasClinicasService.GetHistoriaId(idhistoria);
		const historia = historiaDb.docs[0].data() as IHistoriaClinica;

		const doc = new jsPDF();
	
		const patientName = `${this.auth.usuarioRealActual!.nombre} ${this.auth.usuarioRealActual!.apellido}`;
	
		const logoData = 'assets/logo.png';
		doc.addImage(logoData, 'PNG', 70, 10, 50, 50);
	
		doc.setFontSize(16);
		doc.text('Historia Clinica', 76, 70);
		
		doc.setFontSize(12);
		doc.text(`Paciente: ${patientName}`, 10, 80);
		
		const currentDate = new Date();
		const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
		const formattedDate = currentDate.toLocaleDateString('es-AR', optionsDate);
		doc.text(`Fecha: ${formattedDate}`, 10, 90);
		
		doc.text('Datos Fijos:', 10, 110); // 2do y 3er param serán ubicacion en ejes de la pag
		doc.text(`Altura: ${historia.altura} cm`, 10, 120);
		doc.text(`Peso: ${historia.peso} kg`, 10, 130);
		doc.text(`Temperatura: ${historia.temperatura} °C`, 10, 140);
		doc.text(`Presion: ${historia.presion}`, 10, 150);
		
		const array = [historia.dinamico1, historia.dinamico2, historia.dinamico3];
		let y_inicial = 160; // pq automaticamente le sumo 10

		array.forEach((e) => {
			if (e != "") {
				y_inicial += 10;
				doc.text(`${e}`, 10, y_inicial);	
			}				
		})

		doc.save(`${patientName}_${formattedDate}_HistoriaClinica.pdf`);
	}

	async generarPDFEspecialistas(especialista: IEspecialista) {
		this.loading.mostrarSpinner();
	  
		const doc = new jsPDF();
		const logoData = 'assets/logo.png';
	  
		// Agregar logo y encabezado en la primera página
		doc.addImage(logoData, 'PNG', 70, 10, 50, 50);
		doc.setFontSize(16);
		doc.text('Historia Clínica', 76, 70);
		doc.setFontSize(12);
		doc.text(`Paciente: ${this.auth.usuarioRealActual?.nombre}, ${this.auth.usuarioRealActual?.apellido}`, 10, 80);
		doc.text(`Especialista: ${especialista.nombre}, ${especialista.apellido}`, 10, 90);
	  
		// Obtener las historias del especialista y el paciente
		const historiasDb = await this.historiasClinicasService.GetHistoriasEspecialistaYPaciente(
		  especialista.id,
		  this.auth.usuarioRealActual!.id
		);
	  
		let yOffset = 110; // Iniciar debajo del encabezado
	  
		for (let i = 0; i < historiasDb.docs.length; i++) {
		  const historia = historiasDb.docs[i].data() as IHistoriaClinica;
		
		  // Insertar los datos de la historia
		  doc.setFontSize(12);
		  doc.text(`Historia ${i + 1}`, 10, yOffset);
		  yOffset += 10;
		  doc.text(`Altura: ${historia.altura} cm`, 10, yOffset);
		  yOffset += 10;
		  doc.text(`Peso: ${historia.peso} kg`, 10, yOffset);
		  yOffset += 10;
		  doc.text(`Temperatura: ${historia.temperatura} °C`, 10, yOffset);
		  yOffset += 10;
		  doc.text(`Presión: ${historia.presion}`, 10, yOffset);
		  yOffset += 10;
	  
		  // Insertar datos dinámicos
		  const datosDinamicos = [historia.dinamico1, historia.dinamico2, historia.dinamico3];
		  datosDinamicos.forEach((dato) => {
			if (dato) {
			  doc.text(dato, 10, yOffset);
			  yOffset += 10;
			}
		  });
	  
		  // Separador
		  doc.text('____________________', 10, yOffset);
		  yOffset += 10;
	  
		  // Comprobar si es necesario crear una nueva página
		  if (yOffset > 280) {
			doc.addPage();
			yOffset = 20; // Reiniciar el yOffset en la nueva página
		  }
		}
	  
		// Guardar el PDF
		const fileName = `HistoriasClinicas_${especialista.nombre}_${new Date().toISOString()}.pdf`;
		doc.save(fileName);
	  
		this.loading.ocultarSpinner();
	  }
	  


	ngOnDestroy(): void {
		if (this.suscripcion){
			this.suscripcion.unsubscribe();
		}
	}
	
}
