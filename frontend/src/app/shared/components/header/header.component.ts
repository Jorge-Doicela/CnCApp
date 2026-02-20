import { Component, inject, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, MenuController } from '@ionic/angular/standalone';
import { AuthService } from '../../../features/auth/services/auth.service';
import { addIcons } from 'ionicons';
import { menuOutline, arrowForward } from 'ionicons/icons';

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
        IonIcon
    ]
})
export class HeaderComponent {
    private authService = inject(AuthService);
    public router = inject(Router);
    private menuCtrl = inject(MenuController);

    userName = this.authService.userName;

    // Computed Role Helpers
    isGuest = computed(() => !this.userName());

    constructor() {
        addIcons({ menuOutline, arrowForward });
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
            'Ver Perfil': 'ver-perfil'
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
}
