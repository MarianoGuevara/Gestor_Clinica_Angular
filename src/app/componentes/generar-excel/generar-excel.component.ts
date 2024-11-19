import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { SpinnerComponent } from '../spinner/spinner.component';
import * as XLSX from 'xlsx';
import { IUsuario, IPaciente, IEspecialista, IAdministrador } from '../../interfaces/interfaces';
import { from } from 'rxjs';
import { PacientesService } from '../../servicios/pacientes.service';
import { EspecialistasService } from '../../servicios/especialistas.service';
import { AdminService } from '../../servicios/admin.service';
import { LoadingService } from '../../servicios/loading.service';
import { AlertService } from '../../servicios/alert.service';
import { QuerySnapshot } from '@angular/fire/firestore';
import { QueryDocumentSnapshot, DocumentData } from '@angular/fire/firestore';

@Component({
  selector: 'app-generar-excel',
  standalone: true,
  imports: [
	
    BtnDirective,
  ],
  templateUrl: './generar-excel.component.html',
  styleUrl: './generar-excel.component.css'
})
export class GenerarExcelComponent {
    auth = inject(AuthService);
	usuarios: (IPaciente | IEspecialista | IAdministrador)[] = [];
	pacientesService = inject(PacientesService);
	especialistasService = inject(EspecialistasService);
	adminService = inject(AdminService);
	loading = inject(LoadingService);
	alert = inject(AlertService);

	async ngOnInit() {
		// this.loading.mostrarSpinner();

		const especialistas = await this.especialistasService.GetEspecialistasTotal();
		await this.agregarArray(especialistas.docs.length, especialistas.docs, "especialista");

		const pacientes = await this.pacientesService.GetPacientesTotal();
		await this.agregarArray(pacientes.docs.length, pacientes.docs, "paciente");

		const admins = await this.adminService.GetAdminsTotal();
		await this.agregarArray(admins.docs.length, admins.docs, "administrador");

		console.log(this.usuarios);

		// this.loading.ocultarSpinner();
	}	

	async agregarArray(len:number, arrayDb:QueryDocumentSnapshot<DocumentData, DocumentData>[], tipo:string) {
		for (let i=0; i<len; i++) {
			switch (tipo){
				case "especialista":
					this.usuarios.push(arrayDb[i].data() as IEspecialista)
					break
				case "administrador":
					this.usuarios.push(arrayDb[i].data() as IAdministrador)
					break
				case "paciente":
					this.usuarios.push(arrayDb[i].data() as IPaciente)
					break
			}
		}
	}

	async exportToExcel() {
		// Convertimos el array de usuarios en un formato que Excel pueda entender
		const formattedData = this.usuarios.map(usuario => {
		  // Si el usuario es un paciente, agregamos los campos específicos
		  if ('obraSocial' in usuario) {
			return {
			  Nombre: usuario.nombre,
			  Apellido: usuario.apellido,
			  Edad: usuario.edad,
			  DNI: usuario.dni,
			  Mail: usuario.mail,
			  Rol: usuario.rol,
			  Verificado: usuario.verificado ? 'Sí' : 'No', // transformo el bool a un string
			  Id: usuario.id,
			  ObraSocial: usuario.obraSocial,
			  ImagenPerfil: usuario.imagenPerfil,
			  ImagenPerfil2: usuario.imagenPerfil2
			};
		  }
	
		  // Si el usuario es un especialista, agregamos sus especialidades
		  if ('especialidad' in usuario) {
			return {
			  Nombre: usuario.nombre,
			  Apellido: usuario.apellido,
			  Edad: usuario.edad,
			  DNI: usuario.dni,
			  Mail: usuario.mail,
			  Rol: usuario.rol,
			  Verificado: usuario.verificado ? 'Sí' : 'No',
			  Id: usuario.id,
			  Especialidad: usuario.especialidad.join(', '), // Unimos las especialidades en una cadena
			  ImagenPerfil: usuario.imagenPerfil
			};
		  }
	
		  // Si es un administrador, simplemente devolvemos los campos generales
		  return {
			Nombre: usuario.nombre,
			Apellido: usuario.apellido,
			Edad: usuario.edad,
			DNI: usuario.dni,
			Mail: usuario.mail,
			Rol: usuario.rol,
			Verificado: usuario.verificado ? 'Sí' : 'No',
			Id: usuario.id,
			ImagenPerfil: usuario.imagenPerfil
		  };
		});
	
		// Creamos el libro de trabajo y la hoja
		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
	
		// Exportamos el archivo Excel
		XLSX.writeFile(wb, 'usuarios.xlsx');
	  }
}
