import { Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { RecuperarPasswordPage } from './recuperar-password/recuperar-password.page';

export const AUTH_ROUTES: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
    },
    {
        path: 'register',
        loadComponent: () => import('./register/register.page').then(m => m.RegisterPage)
    },
    {
        path: 'recuperar-password',
        loadComponent: () => import('./recuperar-password/recuperar-password.page').then(m => m.RecuperarPasswordPage)
    }
];
