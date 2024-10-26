import { Directive, ElementRef, inject, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appBtn]',
  standalone: true
})
export class BtnDirective {
    elemento = inject(ElementRef);
    @Input() btn:string="normal";

    ngOnInit(): void {
        if (this.btn == "normal") {this.colorDefault();}
        else {this.colorOutlined();}
    }
    // @Input() color:string = "";

    @HostListener('mouseenter') onMouseEnter() {
        this.elemento.nativeElement.style.cursor = "pointer"

        if (this.btn == "normal") {this.elemento.nativeElement.style.backgroundColor = "violet";}
        else {
            this.elemento.nativeElement.style.border = "violet solid 2px";
            this.elemento.nativeElement.style.color = "violet";
        }
        
    }
    @HostListener('mouseleave') onMouseLeave() {
        this.elemento.nativeElement.style.cursor = ""

        if (this.btn == "normal") {this.colorDefault();}
        else {this.colorOutlined();}
    } 

    colorDefault()
    {
        this.elemento.nativeElement.style.color = "rgb(58, 64, 70)";
        this.elemento.nativeElement.style.backgroundColor  = "rgb(153, 65, 190)";
    }
    colorOutlined()
    {
        this.elemento.nativeElement.style.backgroundColor = "transparent";
        this.elemento.nativeElement.style.color = "rgb(153, 65, 190)";
        this.elemento.nativeElement.style.border = "solid rgb(153, 65, 190) 2px"
    }
}
