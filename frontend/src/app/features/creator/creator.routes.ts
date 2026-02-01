import { Routes } from '@angular/router';
import { creatorGuard } from '../../core/guards/creator.guard';

// Reusing Admin components but guarding them with creatorGuard
export const CREATOR_ROUTES: Routes = [
    {
        path: 'creator/gestionar-capacitaciones',
        loadComponent: () => import('../admin/capacitaciones/crudcapacitaciones.page').then(m => m.CrudcapacitacionesPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'creator/gestionar-capacitaciones/crear',
        loadComponent: () => import('../admin/capacitaciones/crear/crear.page').then(m => m.CrearPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'creator/gestionar-capacitaciones/editar/:id',
        loadComponent: () => import('../admin/capacitaciones/editar/editar.page').then(m => m.EditarPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'creator/gestionar-capacitaciones/visualizar-inscritos/:id',
        loadComponent: () => import('../admin/capacitaciones/visualizarinscritos/visualizarinscritos.page').then(m => m.VisualizarinscritosPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'creator/certificados/:Id_Capacitacion',
        loadComponent: () => import('../admin/certificados/certificados.page').then(m => m.CertificadosPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'creator/plantillas',
        loadComponent: () => import('../admin/plantillas/plantillas.page').then(m => m.PlantillasPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'creator/plantillas/crear',
        loadComponent: () => import('../admin/plantillas/crear/crear.page').then(m => m.CrearPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'creator/plantillas/editar/:id',
        loadComponent: () => import('../admin/plantillas/crear/crear.page').then(m => m.CrearPage),
        canActivate: [creatorGuard]
    }
];
