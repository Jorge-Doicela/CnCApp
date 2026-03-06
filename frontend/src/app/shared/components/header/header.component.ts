import { Component, inject, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonMenuButton, MenuController } from '@ionic/angular/standalone';
import { AuthService } from '../../../features/auth/services/auth.service';
import { addIcons } from 'ionicons';
import { menuOutline, arrowForward, logOutOutline, menu, logInOutline, personAddOutline, people, statsChartOutline, easel, search, ribbon } from 'ionicons/icons';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        RouterModule,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonButton,
        IonIcon,
        IonMenuButton
    ]
})
export class HeaderComponent {
    private authService = inject(AuthService);
    public router = inject(Router);
    private menuCtrl = inject(MenuController);

    userName = this.authService.userName;
    roleName = this.authService.roleName;

    // Computed Role Helpers
    isGuest = computed(() => !this.userName());
    isAdmin = computed(() => {
        const r = this.roleName()?.toLowerCase();
        return r === 'administrador';
    });
    isCreator = computed(() => {
        const r = this.roleName()?.toLowerCase();
        return r?.includes('creador') || r?.includes('conferencista') || r?.includes('conferencia');
    });
    isUser = computed(() => {
        return !this.isAdmin() && !this.isCreator() && !this.isGuest();
    });

    constructor() {
        addIcons({
            menuOutline, arrowForward, logOutOutline, menu, logInOutline, personAddOutline,
            people, statsChartOutline, easel, search, ribbon
        });
    }

    isActive(modulo: string): boolean {
        const currentUrl = this.router.url;
        if (modulo === '/') return currentUrl === '/home' || currentUrl === '/';

        const rutasModulos: { [key: string]: string } = {
            'historia': 'home/historia',
            'direccion': 'home/direccion',
            'norma-regul': 'home/norma-regul',
            'informacion': 'home/informacion',
            'servi-progra': 'home/servi-progra',
            'validar-certificados': 'validar-certificados',
            'Ver Perfil': 'ver-perfil',
            'gestionar-usuarios': 'gestionar-usuarios',
            'gestionar-capacitaciones': 'gestionar-capacitaciones',
            'gestionar-reportes': 'gestionar-reportes',
            'conferencista/gestionar-capacitaciones': 'conferencista/gestionar-capacitaciones',
            'conferencista/gestionar-plantillas': 'conferencista/gestionar-plantillas',
            'ver-conferencias': 'ver-conferencias',
            'ver-certificaciones': 'ver-certificaciones'
        };

        const target = rutasModulos[modulo] || modulo;
        return currentUrl.includes(target);
    }

    toggleMenu() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        this.menuCtrl.toggle();
    }

    navegarModulo(modulo: string) {
        if (modulo === '/') {
            this.router.navigate(['/']);
            return;
        }

        const rutasModulos: { [key: string]: string } = {
            'historia': 'home/historia',
            'direccion': 'home/direccion',
            'norma-regul': 'home/norma-regul',
            'informacion': 'home/informacion',
            'servi-progra': 'home/servi-progra',
            'validar-certificados': 'validar-certificados',
            'Ver Perfil': 'ver-perfil',
            'gestionar-usuarios': 'gestionar-usuarios',
            'gestionar-capacitaciones': 'gestionar-capacitaciones',
            'gestionar-reportes': 'gestionar-reportes',
            'conferencista/gestionar-capacitaciones': 'conferencista/gestionar-capacitaciones',
            'conferencista/gestionar-plantillas': 'conferencista/gestionar-plantillas',
            'ver-conferencias': 'ver-conferencias',
            'ver-certificaciones': 'ver-certificaciones'
        };

        let ruta = rutasModulos[modulo] || modulo;
        this.router.navigate([`/${ruta}`]);
    }

    iraLogin() {
        this.router.navigate(['/login']);
    }

    iraRegistro() {
        this.router.navigate(['/register']);
    }

    cerrarSesion() {
        this.authService.clearAuthData();
        this.router.navigate(['/login']);
    }
}
