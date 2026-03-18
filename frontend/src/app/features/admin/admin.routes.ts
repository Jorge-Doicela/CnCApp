import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { moduleGuard } from '../../core/guards/module.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: 'configuracion-maestros',
        loadComponent: () => import('./configuracion/configuracion.page').then(m => m.ConfiguracionPage),
        canActivate: [adminGuard]
    },
    {
        path: 'gestionar-reportes',
        loadComponent: () => import('./reportes/reportes.page').then(m => m.ReportesPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar reportes' }
    },
    {
        path: 'gestionar-usuarios',
        loadComponent: () => import('./users/crudusuarios.page').then(m => m.CRUDUsuariosPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar usuarios' }
    },
    {
        path: 'gestionar-usuarios/crear',
        loadComponent: () => import('./users/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar usuarios' }
    },
    {
        path: 'gestionar-usuarios/editar/:id',
        loadComponent: () => import('./users/editar/editar.page').then(m => m.EditarPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar usuarios' }
    },
    {
        path: 'gestionar-usuarios/detalles/:id',
        loadComponent: () => import('./users/detalles/detalles.page').then(m => m.DetallesPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar usuarios' }
    },
    {
        path: 'gestionar-roles',
        loadComponent: () => import('./roles/crudroles.page').then(m => m.CRUDRolesPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar roles' }
    },
    {
        path: 'gestionar-roles/crear',
        loadComponent: () => import('./roles/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar roles' }
    },
    {
        path: 'gestionar-roles/editar/:id',
        loadComponent: () => import('./roles/editar/editar.page').then(m => m.EditarPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar roles' }
    },
    {
        path: 'gestionar-entidades',
        loadComponent: () => import('./entidades/crudentidades.page').then(m => m.CrudentidadesPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar entidades' }
    },
    {
        path: 'gestionar-entidades/crear',
        loadComponent: () => import('./entidades/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar entidades' }
    },
    {
        path: 'gestionar-entidades/editar/:id',
        loadComponent: () => import('./entidades/editar/editar.page').then(m => m.EditarPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar entidades' }
    },
    {
        path: 'gestionar-capacitaciones',
        loadComponent: () => import('./capacitaciones/crudcapacitaciones.page').then(m => m.CrudcapacitacionesPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar capacitaciones' }
    },
    {
        path: 'gestionar-capacitaciones/crear',
        loadComponent: () => import('./capacitaciones/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar capacitaciones' }
    },
    {
        path: 'gestionar-capacitaciones/editar/:id',
        loadComponent: () => import('./capacitaciones/editar/editar.page').then(m => m.EditarPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar capacitaciones' }
    },
    {
        path: 'gestionar-capacitaciones/visualizar-inscritos/:id',
        loadComponent: () => import('./capacitaciones/visualizarinscritos/visualizarinscritos.page').then(m => m.VisualizarinscritosPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar capacitaciones' }
    },
    {
        path: 'certificados/:id',
        loadComponent: () => import('./certificados/certificados.page').then(m => m.CertificadosPage),
        canActivate: [adminGuard]
    },
    {
        path: 'gestionar-provincias',
        loadComponent: () => import('./provincias/crudprovincias.page').then(m => m.CrudprovinciasPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar provincias' }
    },
    {
        path: 'gestionar-provincias/crear',
        loadComponent: () => import('./provincias/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar provincias' }
    },
    {
        path: 'gestionar-provincias/editar/:id',
        loadComponent: () => import('./provincias/editar/editar.page').then(m => m.EditarPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar provincias' }
    },
    {
        path: 'gestionar-parroquias',
        loadComponent: () => import('./parroquias/crudparroquias.page').then(m => m.CrudparroquiasPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar parroquias' }
    },
    {
        path: 'gestionar-parroquias/crear',
        loadComponent: () => import('./parroquias/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar parroquias' }
    },
    {
        path: 'gestionar-parroquias/editar/:id',
        loadComponent: () => import('./parroquias/editar/editar.page').then(m => m.EditarPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar parroquias' }
    },
    {
        path: 'gestionar-cantones',
        loadComponent: () => import('./cantones/crudcantones.page').then(m => m.CrudcantonesPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar cantones' }
    },
    {
        path: 'gestionar-cantones/crear',
        loadComponent: () => import('./cantones/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar cantones' }
    },
    {
        path: 'gestionar-cantones/editar/:id',
        loadComponent: () => import('./cantones/editar/editar.page').then(m => m.EditarPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar cantones' }
    },
    {
        path: 'gestionar-competencias',
        loadComponent: () => import('./competencias/crudcompetencias.page').then(m => m.CrudcompetenciasPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar competencias' }
    },
    {
        path: 'gestionar-competencias/crear',
        loadComponent: () => import('./competencias/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar competencias' }
    },
    {
        path: 'gestionar-competencias/editar/:id',
        loadComponent: () => import('./competencias/editar/editar.page').then(m => m.EditarPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar competencias' }
    },
    {
        path: 'gestionar-instituciones',
        loadComponent: () => import('./instituciones/crudinstituciones.page').then(m => m.CrudinstitucionesPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar instituciones' }
    },
    {
        path: 'gestionar-instituciones/crear',
        loadComponent: () => import('./instituciones/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar instituciones' }
    },
    {
        path: 'gestionar-instituciones/editar/:id',
        loadComponent: () => import('./instituciones/editar/editar.page').then(m => m.EditarPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar instituciones' }
    },
    {
        path: 'gestionar-cargos-instituciones',
        loadComponent: () => import('./cargos-instituciones/crudcargosinstituciones.page').then(m => m.CrudcargosinstitucionesPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar cargos' }
    },
    {
        path: 'gestionar-cargos-instituciones/crear',
        loadComponent: () => import('./cargos-instituciones/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard]
    },
    {
        path: 'gestionar-cargos-instituciones/editar/:id',
        loadComponent: () => import('./cargos-instituciones/editar/editar.page').then(m => m.EditarPage),
        canActivate: [adminGuard]
    },
    {
        path: 'gestionar-plantillas',
        loadComponent: () => import('./plantillas/plantillas.page').then(m => m.PlantillasPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar plantillas' }
    },
    {
        path: 'gestionar-plantillas/crear',
        loadComponent: () => import('./plantillas/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard]
    },
    {
        path: 'gestionar-plantillas/editar/:id',
        loadComponent: () => import('./plantillas/crear/crear.page').then(m => m.CrearPage),
        canActivate: [adminGuard]
    },
    {
        path: 'gestionar-grados',
        loadComponent: () => import('./grados-ocupacionales/grados-ocupacionales.page').then(m => m.GradosOcupacionalesPage),
        canActivate: [adminGuard, moduleGuard],
        data: { requiredModule: 'Gestionar grados ocupacionales' }
    }
];
