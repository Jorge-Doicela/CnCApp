import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: 'gestionar-usuarios',
        loadComponent: () => import('./users/crudusuarios.page').then(m => m.CRUDUsuariosPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-roles',
        loadComponent: () => import('./roles/crudroles.page').then(m => m.CRUDRolesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-entidades',
        loadComponent: () => import('./entidades/crudentidades.page').then(m => m.CrudentidadesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-capacitaciones',
        loadComponent: () => import('./capacitaciones/crudcapacitaciones.page').then(m => m.CrudcapacitacionesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-capacitaciones/editar/:id',
        loadComponent: () => import('./capacitaciones/crudcapacitaciones.page').then(m => m.CrudcapacitacionesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'certificados/:Id_Capacitacion',
        loadComponent: () => import('./certificados/certificados.page').then(m => m.CertificadosPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-provincias',
        loadComponent: () => import('./provincias/crudprovincias.page').then(m => m.CrudprovinciasPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-parroquias',
        loadComponent: () => import('./parroquias/crudparroquias.page').then(m => m.CrudparroquiasPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-cantones',
        loadComponent: () => import('./cantones/crudcantones.page').then(m => m.CrudcantonesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-competencias',
        loadComponent: () => import('./competencias/crudcompetencias.page').then(m => m.CrudcompetenciasPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-instituciones',
        loadComponent: () => import('./instituciones/crudinstituciones.page').then(m => m.CrudinstitucionesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-cargos-instituciones',
        loadComponent: () => import('./cargos-instituciones/crudcargosinstituciones.page').then(m => m.CrudcargosinstitucionesPage),
        canActivate: [AuthGuard]
    }
];
