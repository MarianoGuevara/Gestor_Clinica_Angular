import { Injectable, inject, OnInit } from '@angular/core';
import {
  Auth,
  User,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Unsubscribe } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { IUsuario } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    logueado: boolean = false;
    usuarioActual: User | null = null;
    
    auth = inject(Auth);
    router = inject (Router)
    authSubscription?: Unsubscribe;
  
    constructor() { }

    verificarSesion(): Promise<User | null> {
        return new Promise((resolve) => {
          this.authSubscription = this.auth.onAuthStateChanged((user) => {
            if (user?.email) {
              this.logueado = true;
              this.usuarioActual = user;
            } else {
              this.logueado = false;
              this.usuarioActual = null;
            }
            resolve(this.usuarioActual);
          });
        });
    }

    getUser(): User | null {
        return this.usuarioActual;
    }

    cerrarSesion(): void {
        signOut(this.auth).then(() => {
          this.usuarioActual = null;
          this.logueado = false;
          this.router.navigate(['/bienvenida']);
        });
    }
    
    async registarUsuario(user: IUsuario) {
        const usuario = await createUserWithEmailAndPassword(this.auth, user.mail, user.password);
        return usuario;
    }
    
    async loguearse(user: IUsuario) {
        const usuario = await signInWithEmailAndPassword(this.auth, user.mail, user.password);
        return usuario;
    }

    ngOnDestroy(): void {
        if (this.authSubscription !== undefined) {
          this.authSubscription();
        }
    }
}
