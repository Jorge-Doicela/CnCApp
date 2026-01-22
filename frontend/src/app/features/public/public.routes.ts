import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
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
        path: 'validar-certificados',
        loadComponent: () => import('./validar-qr/validar-qr.page').then(m => m.ValidarQrPage)
    }
];
