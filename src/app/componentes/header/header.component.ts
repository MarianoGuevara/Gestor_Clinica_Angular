import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { BtnDirective } from '../../directivas/btn.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    BtnDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
    auth = inject(AuthService);

    cerrarSesion() {
        this.auth.cerrarSesion();
    }
}
