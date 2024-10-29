import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { BtnDirective } from '../../directivas/btn.directive';
import { AuthService } from '../../servicios/auth.service';

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
    auth = inject(AuthService);
}
