import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTxt]',
  standalone: true
})
export class TxtDirective {
  @Input() txt: string = 'header';

  constructor(private elemento: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.elemento.nativeElement, 'cursor', 'pointer');
    if (this.txt === 'header') {
      this.renderer.setStyle(this.elemento.nativeElement, 'color', 'rgb(205, 205, 205)');
	  this.renderer.setStyle(this.elemento.nativeElement, 'background-color', '#7f299e');
    } else {
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.elemento.nativeElement, 'cursor', '');
    if (this.txt === 'header') {
      this.renderer.setStyle(this.elemento.nativeElement, 'color', 'rgb(255, 255, 255)');
	  this.renderer.removeStyle(this.elemento.nativeElement, 'background-color');
    } else {

    }
  }
}
