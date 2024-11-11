import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fecha',
  standalone: true
})
export class FechaPipe implements PipeTransform {
	transform(date: string): string { // formatea de 08:00 a 08:00 pm para
		const connector = this.AmPm(date);
		return date + " " + connector;
	  }

	AmPm(date:string): string {
		const arraySplitt = date.split(":")
		const fechaInt: number =  parseInt(arraySplitt[0]);
		if (fechaInt > 11) {return "PM";}
		else {return "AM";}
	}
}
