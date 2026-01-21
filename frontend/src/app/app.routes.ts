import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // Ruta por defecto
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    // Páginas de home y públicas
    {
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
        children: [
            {
                path: 'direccion',
                loadComponent: () => import('./home/pages/direccion/direccion.page').then(m => m.DireccionPage)
            },
            {
                path: 'historia',
                loadComponent: () => import('./home/pages/historia/historia.page').then(m => m.HistoriaPage)
            },
            {
                path: 'informacion',
                loadComponent: () => import('./home/pages/informacion/informacion.page').then(m => m.InformacionPage)
            },
            {
                path: 'norma-regul',
                loadComponent: () => import('./home/pages/norma-regul/norma-regul.page').then(m => m.NormaRegulPage)
            },
            {
                path: 'servi-progra',
                loadComponent: () => import('./home/pages/servi-progra/servi-progra.page').then(m => m.ServiPrograPage)
            }
        ]
    },
    {
        path: 'direccion',
        loadComponent: () => import('./home/pages/direccion/direccion.page').then(m => m.DireccionPage)
    },
    {
        path: 'historia',
        loadComponent: () => import('./home/pages/historia/historia.page').then(m => m.HistoriaPage)
    },
    {
        path: 'informacion',
        loadComponent: () => import('./home/pages/informacion/informacion.page').then(m => m.InformacionPage)
    },
    {
        path: 'norma-regul',
        loadComponent: () => import('./home/pages/norma-regul/norma-regul.page').then(m => m.NormaRegulPage)
    },
    {
        path: 'servi-progra',
        loadComponent: () => import('./home/pages/servi-progra/servi-progra.page').then(m => m.ServiPrograPage)
    },
    // Rutas de autenticación
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage)
    },
    // Rutas para administradores
    {
        path: 'gestionar-usuarios',
        loadComponent: () => import('./pages/admin/crudusuarios/crudusuarios.page').then(m => m.CRUDUsuariosPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-roles',
        loadComponent: () => import('./pages/admin/crudroles/crudroles.page').then(m => m.CRUDRolesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-entidades',
        loadComponent: () => import('./pages/admin/crudentidades/crudentidades.page').then(m => m.CrudentidadesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-capacitaciones',
        loadComponent: () => import('./pages/admin/crudcapacitaciones/crudcapacitaciones.page').then(m => m.CrudcapacitacionesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-capacitaciones/editar/:id',
        loadComponent: () => import('./pages/admin/crudcapacitaciones/crudcapacitaciones.page').then(m => m.CrudcapacitacionesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'certificados/:Id_Capacitacion',
        loadComponent: () => import('./pages/admin/certificados/certificados.page').then(m => m.CertificadosPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-provincias',
        loadComponent: () => import('./pages/admin/crudprovincias/crudprovincias.page').then(m => m.CrudprovinciasPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-parroquias',
        loadComponent: () => import('./pages/admin/crudparroquias/crudparroquias.page').then(m => m.CrudparroquiasPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-cantones',
        loadComponent: () => import('./pages/admin/crudcantones/crudcantones.page').then(m => m.CrudcantonesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-competencias',
        loadComponent: () => import('./pages/admin/crudcompetencias/crudcompetencias.page').then(m => m.CrudcompetenciasPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-instituciones',
        loadComponent: () => import('./pages/admin/crudinstituciones/crudinstituciones.page').then(m => m.CrudinstitucionesPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'gestionar-cargos-instituciones',
        loadComponent: () => import('./pages/admin/crudcargosinstituciones/crudcargosinstituciones.page').then(m => m.CrudcargosinstitucionesPage),
        canActivate: [AuthGuard]
    },
    // Rutas para usuarios registrados
    {
        path: 'ver-perfil',
        loadComponent: () => import('./pages/user/perfil/perfil.page').then(m => m.PerfilPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'ver-conferencias',
        loadComponent: () => import('./pages/user/conferencias/conferencias.page').then(m => m.ConferenciasPage),
        canActivate: [AuthGuard]
    },
    // Aplicaciones públicas
    {
        path: 'validar-certificados',
        loadComponent: () => import('./pages/apps/validar-qr/validar-qr.page').then(m => m.ValidarQrPage)
    },
    {
        path: 'recuperar-password',
        loadComponent: () => import('./pages/auth/recuperar-password/recuperar-password.page').then(m => m.RecuperarPasswordPage)
    },
    // Wildcard route for handling 404
    {
        path: '**',
        redirectTo: 'home'
    }
];
