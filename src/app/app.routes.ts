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
        path: 'admin-usuarios',
        loadComponent: ()=> import('./componentes/seccion-usuarios-admin/seccion-usuarios-admin.component').then(m => m.SeccionUsuariosAdminComponent)
    },
	{
        path: 'mis-turnos',
        loadComponent: ()=> import('./componentes/pacientes-turnos/pacientes-turnos.component').then(m => m.PacientesTurnosComponent)
    },
	{
        path: 'mi-perfil',
        loadComponent: ()=> import('./componentes/mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent)
    },
	{
        path: 'alta-turno',
        loadComponent: ()=> import('./componentes/alta-turno/alta-turno.component').then(m => m.AltaTurnoComponent)
    },
	{
        path: 'historias-clinicas',
        loadComponent: ()=> import('./componentes/listado-hisotrias-clinicas/listado-hisotrias-clinicas.component').then(m => m.ListadoHisotriasClinicasComponent)
    },
];
