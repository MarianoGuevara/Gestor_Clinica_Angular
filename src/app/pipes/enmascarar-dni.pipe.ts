import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enmascararDni',
  standalone: true
})
export class EnmascararDniPipe implements PipeTransform {
	transform(dni: any): string {
		dni = String(dni)
		return dni.slice(-4).padStart(dni.length, '*');
	}
}