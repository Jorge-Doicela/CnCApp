import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
    IonContent, IonButton,
    IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    mapOutline, locationOutline, pinOutline, business, businessOutline,
    idCardOutline, ribbonOutline, ribbon, arrowBack, statsChartOutline,
    people, easel, image
} from 'ionicons/icons';
import { AuthService } from '../../auth/services/auth.service';

@Component({
    selector: 'app-configuracion',
    templateUrl: './configuracion.page.html',
    styleUrls: ['./configuracion.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonContent, IonButton,
        IonIcon
    ]
})
export class ConfiguracionPage {
    private authService = inject(AuthService);
    public router = inject(Router);

    userName = this.authService.userName;

    constructor() {
        addIcons({
            mapOutline, locationOutline, pinOutline, business, businessOutline,
            idCardOutline, ribbonOutline, ribbon, arrowBack, statsChartOutline,
            people, easel, image
        });
    }

    navegarModulo(ruta: string) {
        this.router.navigate([`/${ruta}`]);
    }
}
