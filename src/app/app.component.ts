import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './componentes/header/header.component';
import { FooterComponent } from "./componentes/footer/footer.component";
import { AuthService } from './servicios/auth.service';
import { LoadingService } from './servicios/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'clinica-guevara';

    loading = inject(LoadingService);
    auth = inject(AuthService);
    private router = inject(Router);

    async ngOnInit(): Promise<void> {
        this.loading.mostrarSpinner();
        try {
            const user = await this.auth.verificarSesion(); 
            const verificado = await this.auth.verificarEmail(); 
    
            if (user != null) {
                if (verificado) {
                    this.router.navigate(["/home"]);
                } else {
                    this.auth.cerrarSesion("/bienvenida");
                }
            } else {
                this.router.navigate(["/bienvenida"]);
            }
        } catch (error) {
            console.error('Error al verificar sesión:', error);
        } finally {
            this.loading.ocultarSpinner();
        }
    }
    
}
