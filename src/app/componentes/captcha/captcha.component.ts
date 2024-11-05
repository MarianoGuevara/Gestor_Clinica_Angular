import { Component, EventEmitter, Output, inject } from '@angular/core';
import { NgxCaptchaModule } from 'ngx-captcha';

declare global {
	interface Window {
	  grecaptcha: {
		render: (container: string, options: { sitekey: string; callback?: (response: string) => void }) => number;
		getResponse: () => string;
	  };
	}
}

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [
	NgxCaptchaModule
  ],
  templateUrl: './captcha.component.html',
  styleUrl: './captcha.component.css'
})
export class CaptchaComponent {
	siteKey: string = '6LdnZHUqAAAAALlOXOD2p4xPKuKmatxVmo9KVzR6';
	captchaResponse: string | null = null;
	@Output() captchaCompletado: EventEmitter<boolean> = new EventEmitter<boolean>(); 

	ngOnInit(): void {
		this.renderRecaptcha();
	}

	renderRecaptcha() {
		window['grecaptcha'].render('recaptcha-container', {
			sitekey: this.siteKey,
			callback: (response: string) => {
				this.captchaResponse = response; 
				console.log("kjdkdf");
				this.captchaCompletado.emit(true); 
			},
		});
	}
}