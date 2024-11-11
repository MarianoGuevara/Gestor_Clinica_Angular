import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { BtnDirective } from '../../directivas/btn.directive';
import { SpinnerComponent } from '../spinner/spinner.component';
import { TxtDirective } from '../../directivas/txt.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    BtnDirective,
	SpinnerComponent,
	TxtDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
    auth = inject(AuthService);

    ngOnInit(): void {
        if (this.auth.usuarioRealActual?.verificado == false) {this.auth.cerrarSesion("login")}
    }

    cerrarSesion() {
        this.auth.cerrarSesion("login");
    }
}
