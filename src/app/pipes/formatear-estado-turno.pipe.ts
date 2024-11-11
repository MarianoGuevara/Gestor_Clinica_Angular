import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatearEstadoTurno',
  standalone: true
})
export class FormatearEstadoTurnoPipe implements PipeTransform {
	transform(estado: string): string {
		switch (estado.toLowerCase()) {
		  case 'pendiente de aprobacion':	
			return 'Pendiente de aprobación ⏳';
		  case 'aceptado':
			return 'Aceptado ✅';
		  case 'finalizado':
			return 'Finalizado ✔️';
		  case 'rechazado':
			return 'Rechazado ❌';
		  case 'cancelado':
			return 'Cancelado ❌';
		  default:
			return estado;
		}
	  }
}
