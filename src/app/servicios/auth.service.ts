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
import { EspecialistasService } from './especialistas.service';
import { IEspecialista } from '../interfaces/interfaces';
import { IAdministrador } from '../interfaces/interfaces';
import { IPaciente } from '../interfaces/interfaces';
import { PacientesService } from './pacientes.service';
import { AdminService } from './admin.service';
import { LoadingService } from './loading.service';
import { sendEmailVerification } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    logueado: boolean = false;
    usuarioActual: User | null = null;
    usuarioRealActual: IUsuario|null = null;
    auth = inject(Auth);
    router = inject (Router)
    authSubscription?: Unsubscribe;
    especialistaService = inject(EspecialistasService);
    pacienteService = inject(PacientesService);
    adminService = inject(AdminService);
    loading = inject(LoadingService);

    constructor() { }

    async verificarSesion(): Promise<User | null> {
        return new Promise(async (resolve) => { 
            this.authSubscription = this.auth.onAuthStateChanged(async (user) => {
                if (user?.email) {
                    this.logueado = true;
                    this.usuarioActual = user;
    
                    const email = user.email;
                    const especialistaRetorno = this.especialistaService.GetEspecialista(email);
                    const pacienteRetorno = this.pacienteService.GetPaciente(email);
                    const adminRetorno = this.adminService.GetAdmin(email);

                    if ((await especialistaRetorno).empty == false)
                    {
                        (await especialistaRetorno).docs.forEach(doc => {
                            const especialistaData = doc.data() as IEspecialista;
                            this.usuarioRealActual = especialistaData;
                            // console.log('Usuario especialista', especialistaData);
                        });
                    }
                    else if ((await pacienteRetorno).empty == false)
                    {
                        (await pacienteRetorno).docs.forEach(doc => {
                            const pacienteData = doc.data() as IPaciente; 
                            this.usuarioRealActual = pacienteData;
                            // console.log('Usuario paciente', pacienteData);
                        });
                    }
                    else if ((await adminRetorno).empty == false)
                    {
                        (await adminRetorno).docs.forEach(doc => {
                            const adminData = doc.data() as IAdministrador; 
                            this.usuarioRealActual = adminData;
                            // console.log('Usuario administrador', adminData);
                        });
                    }
                    console.log(this.usuarioRealActual);
                } else {
                    this.logueado = false;
                    this.usuarioActual = null;
                }
                resolve(this.usuarioActual);
            });
        });
    }
    

    public determinarTipoUsuario(): string | null {
        if (this.usuarioActual == null) {
            return null; 
        }
        // console.log("LLAMADO A DETERMINAR");

        let retorno:string = "";
        if ('especialidad' in this.usuarioRealActual!) { 
            // console.log("especialista");
            retorno = 'especialista';
        } else if ('obraSocial' in this.usuarioRealActual!) { 
            // console.log("paciente");
            retorno = 'paciente';
        } else {
            // console.log("admin");
            retorno = 'administrador';
        }
        return retorno;
    }


    getUser(): User | null {
        return this.usuarioActual;
    }

    cerrarSesion(navegar:string): void {
        signOut(this.auth).then(() => {
          this.usuarioActual = null;
          this.usuarioRealActual = null;
          this.logueado = false;
          this.router.navigate([navegar]);
        });
    }
    
    async registarUsuario(user: IUsuario) {
        // const usuario = await createUserWithEmailAndPassword(this.auth, user.mail, user.password);
        // return usuario;
        try
        {
            const usuario = await createUserWithEmailAndPassword(this.auth, user.mail, user.password);

            const usuarioFirebase = usuario.user;
            await sendEmailVerification(usuarioFirebase);

            return usuario;
        }
        catch (e){throw e;}
    }
    
    async loguearse(user: IUsuario) {
        const usuario = await signInWithEmailAndPassword(this.auth, user.mail, user.password);
        return usuario;
    }

    async verificarEmail() {
        await this.usuarioActual!.reload();  // Recarga la información del usuario
        return this.usuarioActual!.emailVerified;  // Retorna true si el email está verificado
    }

    ngOnDestroy(): void {
        if (this.authSubscription !== undefined) {
          this.authSubscription();
        }
    }
}
