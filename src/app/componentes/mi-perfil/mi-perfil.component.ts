import { Component, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { IUsuario } from '../../interfaces/interfaces';
import { IEspecialista, IHorariosEspecialista} from '../../interfaces/interfaces';
import { IPaciente } from '../../interfaces/interfaces';
import { BtnDirective } from '../../directivas/btn.directive';
import { HorariosService } from '../../servicios/horarios.service';
import { LoadingService } from '../../servicios/loading.service';
import { AlertService } from '../../servicios/alert.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [
	BtnDirective,
	RouterLink
  ],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent {
	user = inject(AuthService)
	horariosService = inject(HorariosService);
	loading = inject(LoadingService);
	alertService = inject(AlertService);
	diaSemana = [
		"lunes",
		"martes",
		"miercoles",
		"viernes",
		"jueves",
		"sabado",
	];
	horariosDiaSemana = [
		"08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
		"12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
		"16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
	];
	horariosfinDeSemana = [
		"08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
		"12:00", "12:30", "13:00", "13:30", "14:00",
	];
	horariosActual: IHorariosEspecialista | null = null;

	ngOnInit()
	{
		// this.loading.mostrarSpinner();
		this.horariosService.GetHorario(this.user.usuarioRealActual?.id!)
		.then((rta)=>{
			if (rta.empty)
			{
				this.horariosActual = null;
			}
			else
			{
				const doc = rta.docs[0]; 
				this.horariosActual = {
					id: doc.id,
					idEspecialista: doc.data()["idEspecialista"],
					lunes: doc.data()["lunes"],
					martes: doc.data()["martes"],
					miercoles: doc.data()["miercoles"],
					jueves: doc.data()["jueves"],
					viernes: doc.data()["viernes"],
					sabado: doc.data()["sabado"]
				} as IHorariosEspecialista;

				console.log("CONSTRUCT");
				console.log(this.horariosActual);
			}
		});

	}

	async generarHorarios()
	{
		let lunes: string[] = [];
		let martes: string[] = [];
		let miercoles: string[] = [];
		let jueves: string[] = [];
		let viernes: string[] = [];
		let sabado: string[] = [];

		for (let i=0; i<this.diaSemana.length; i++)
		{
			if (this.diaSemana[i] != "sabado")
			{
				for (let j=0; j<this.horariosDiaSemana.length; j++)
				{
					let check = document.getElementById(this.diaSemana[i]+"-"+this.horariosDiaSemana[j]) as HTMLInputElement;
					if (check!.checked)
					{
						switch (this.diaSemana[i])
						{
							case "lunes":
								lunes.push(this.horariosDiaSemana[j]);
								break;
							case "martes":
								martes.push(this.horariosDiaSemana[j]);
								break;
							case "miercoles":
								miercoles.push(this.horariosDiaSemana[j]);
								break;
							case "jueves":
								jueves.push(this.horariosDiaSemana[j]);
								break;
							case "viernes":
								viernes.push(this.horariosDiaSemana[j]);
								break;
						}
					}
				}
			}
			else
			{
				for (let j=0; j<this.horariosfinDeSemana.length; j++)
				{
					let check = document.getElementById(this.diaSemana[i]+"-"+this.horariosfinDeSemana[j]) as HTMLInputElement;
					if (check!.checked)
					{
						sabado.push(this.horariosfinDeSemana[j])
					}
				}
			}
		}
		console.log(lunes);
		console.log(martes);
		console.log(miercoles);
		console.log(jueves);
		console.log(viernes);
		console.log(sabado);

		const horarios: IHorariosEspecialista = {
			id: "",
			idEspecialista: this.user.usuarioRealActual?.id || "",
			lunes: lunes,
			martes: martes,
			miercoles: miercoles,
			jueves: jueves,
			viernes: viernes,
			sabado: sabado,
		}

		await this.altaHorarios(horarios);
	}

	async altaHorarios(horarios: IHorariosEspecialista)
	{
		this.loading.mostrarSpinner();
		const docRta = await this.horariosService.GetHorario(horarios.idEspecialista)
		if (docRta.empty)
		{
			await this.horariosService.Alta(horarios);
			this.alertService.Alerta("Horarios subidos", "Horarios del especialista '"+this.user.usuarioRealActual?.apellido+"' subidos correctamente!", "success").then(()=>{
				this.loading.ocultarSpinner();
			});
		}
		else
		{
			horarios.id = this.horariosActual?.id || "";
			await this.horariosService.actualizarHorarios(horarios);
			this.alertService.Alerta("Horarios actualizados", "Horarios del especialista '"+this.user.usuarioRealActual?.apellido+"' actualizados correctamente!", "success").then(()=>{
				this.loading.ocultarSpinner();
			});
		}
		
	}

	horarioEsta(horario:string, array:string[])
	{
		let retorno = false;
		for (let i=0; i<array.length; i++)
		{
			if (horario == array[i])
			{
				retorno = true;
				break;
			}
		}
		return retorno;
	}

	limpiarChecks()
	{
		try
		{
			document.querySelectorAll('#formElement input[type=checkbox]').forEach(function(checkElement) {
				const ch = checkElement as HTMLInputElement;
				ch.checked = false;
			});
		}
		catch {}
	}

	

	isPaciente(user: IUsuario): user is IPaciente {
		return user.rol === 'paciente';
	}
	  
	isEspecialista(user: IUsuario): user is IEspecialista {
		return user.rol === 'especialista';
	}
}
