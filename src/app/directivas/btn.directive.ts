import { Directive, ElementRef, inject, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appBtn]',
  standalone: true
})
export class BtnDirective {
    elemento = inject(ElementRef);
  
    constructor() 
    { 
        this.colorDefault();
    }
    // @Input() color:string = "";

    @HostListener('mouseenter') onMouseEnter() {
        this.elemento.nativeElement.style.cursor = "pointer"
        this.elemento.nativeElement.style.backgroundColor = "rgb(28, 193, 130)";
    }
    @HostListener('mouseleave') onMouseLeave() {
        this.elemento.nativeElement.style.cursor = ""
        this.colorDefault();
    } 

    colorDefault()
    {
        this.elemento.nativeElement.style.color = "rgb(17, 21, 107)";
        this.elemento.nativeElement.style.backgroundColor  = "rgb(0, 255, 157)";
    }

}
