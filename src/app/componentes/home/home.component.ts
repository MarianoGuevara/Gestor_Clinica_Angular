import { Component, inject } from '@angular/core';
import { LoadingService } from '../../servicios/loading.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
    loading = inject(LoadingService)
    ngOnInit(): void {
        this.loading.ocultarSpinner();
    }
}
