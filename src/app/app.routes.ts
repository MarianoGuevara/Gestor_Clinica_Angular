import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'bienvenida',
        loadComponent: ()=> import('./componentes/bienvenida/bienvenida.component').then(m => m.BienvenidaComponent)
    },
    {
        path: 'login',
        loadComponent: ()=> import('./componentes/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'registro',
        loadComponent: ()=> import('./componentes/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'home',
        loadComponent: ()=> import('./componentes/home/home.component').then(m => m.HomeComponent)
    },
];
