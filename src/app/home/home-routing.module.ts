import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },  {
    path: 'direccion',
    loadChildren: () => import('./pages/direccion/direccion.module').then( m => m.DireccionPageModule)
  },
  {
    path: 'historia',
    loadChildren: () => import('./pages/historia/historia.module').then( m => m.HistoriaPageModule)
  },
  {
    path: 'informacion',
    loadChildren: () => import('./pages/informacion/informacion.module').then( m => m.InformacionPageModule)
  },
  {
    path: 'norma-regul',
    loadChildren: () => import('./pages/norma-regul/norma-regul.module').then( m => m.NormaRegulPageModule)
  },
  {
    path: 'servi-progra',
    loadChildren: () => import('./pages/servi-progra/servi-progra.module').then( m => m.ServiPrograPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
