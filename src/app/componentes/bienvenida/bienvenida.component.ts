import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { BtnDirective } from '../../directivas/btn.directive';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    BtnDirective
  ],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.css'
})
export class BienvenidaComponent {
    
}
