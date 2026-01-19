import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  // Ruta por defecto
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  // Páginas de home y públicas
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'direccion',
    loadChildren: () => import('./home/pages/direccion/direccion.module').then(m => m.DireccionPageModule)
  },
  {
    path: 'historia',
    loadChildren: () => import('./home/pages/historia/historia.module').then(m => m.HistoriaPageModule)
  },
  {
    path: 'informacion',
    loadChildren: () => import('./home/pages/informacion/informacion.module').then(m => m.InformacionPageModule)
  },
  {
    path: 'norma-regul',
    loadChildren: () => import('./home/pages/norma-regul/norma-regul.module').then(m => m.NormaRegulPageModule)
  },
  {
    path: 'servi-progra',
    loadChildren: () => import('./home/pages/servi-progra/servi-progra.module').then(m => m.ServiPrograPageModule)
  },
  // Rutas de autenticación
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then(m => m.RegisterPageModule)
  },
  // Rutas para administradores
  {
    path: 'gestionar-usuarios',
    loadChildren: () => import('./pages/admin/crudusuarios/crudusuarios.module').then(m => m.CRUDUsuariosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionar-roles',
    loadChildren: () => import('./pages/admin/crudroles/crudroles.module').then(m => m.CRUDRolesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionar-entidades',
    loadChildren: () => import('./pages/admin/crudentidades/crudentidades.module').then(m => m.CrudentidadesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionar-capacitaciones',
    loadChildren: () => import('./pages/admin/crudcapacitaciones/crudcapacitaciones.module').then(m => m.CrudcapacitacionesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionar-capacitaciones/editar/:id',
    loadChildren: () => import('./pages/admin/crudcapacitaciones/crudcapacitaciones.module').then(m => m.CrudcapacitacionesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'certificados/:Id_Capacitacion',
    loadChildren: () => import('./pages/admin/certificados/certificados.module').then(m => m.CertificadosPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionar-provincias',
    loadChildren: () => import('./pages/admin/crudprovincias/crudprovincias.module').then(m => m.CrudprovinciasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionar-parroquias',
    loadChildren: () => import('./pages/admin/crudparroquias/crudparroquias.module').then(m => m.CrudparroquiasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionar-cantones',
    loadChildren: () => import('./pages/admin/crudcantones/crudcantones.module').then(m => m.CrudcantonesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionar-competencias',
    loadChildren: () => import('./pages/admin/crudcompetencias/crudcompetencias.module').then(m => m.CrudcompetenciasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionar-instituciones',
    loadChildren: () => import('./pages/admin/crudinstituciones/crudinstituciones.module').then(m => m.CrudinstitucionesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gestionar-cargos-instituciones',
    loadChildren: () => import('./pages/admin/crudcargosinstituciones/crudcargosinstituciones.module').then(m => m.CrudcargosinstitucionesPageModule),
    canActivate: [AuthGuard]
  },
  // Rutas para usuarios registrados
  {
    path: 'ver-perfil',
    loadChildren: () => import('./pages/user/perfil/perfil.module').then(m => m.PerfilPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'ver-conferencias',
    loadChildren: () => import('./pages/user/conferencias/conferencias.module').then(m => m.ConferenciasPageModule),
    canActivate: [AuthGuard]
  },
  // Aplicaciones públicas
  {
    path: 'validar-certificados',
    loadChildren: () => import('./pages/apps/validar-qr/validar-qr.module').then(m => m.ValidarQrPageModule)
  },
  {
    path: 'recuperar-password',
    loadChildren: () => import('./pages/auth/recuperar-password/recuperar-password.module').then( m => m.RecuperarPasswordPageModule)
  },
  // Wildcard route for handling 404
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
