import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fecha',
  standalone: true
})
export class FechaPipe implements PipeTransform {
	transform(date: Date): string {

		const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
	  
		const formattedDate = date.toLocaleDateString('es-AR', optionsDate);
	  
		return formattedDate;
	  }

}
