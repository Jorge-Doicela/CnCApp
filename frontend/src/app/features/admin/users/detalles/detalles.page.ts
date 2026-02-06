import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { timeout, finalize } from 'rxjs';
import { addIcons } from 'ionicons';
import {
    personOutline, locationOutline, shieldCheckmarkOutline, mailOutline,
    callOutline, calendarOutline, globeOutline, idCardOutline,
    businessOutline, createOutline, arrowBackOutline, personCircleOutline,
    fingerPrintOutline, timeOutline, alertCircleOutline
} from 'ionicons/icons';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { Usuario } from 'src/app/core/models/usuario.interface';

@Component({
    selector: 'app-detalles',
    templateUrl: './detalles.page.html',
    styleUrls: ['./detalles.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class DetallesPage implements OnInit {
    private activatedRoute = inject(ActivatedRoute);
    private usuarioService = inject(UsuarioService);
    private navCtrl = inject(NavController);
    private cdr = inject(ChangeDetectorRef);

    usuario: Usuario | null = null;
    cargando = true;

    constructor() {
        addIcons({
            'person-outline': personOutline,
            'location-outline': locationOutline,
            'shield-checkmark-outline': shieldCheckmarkOutline,
            'mail-outline': mailOutline,
            'call-outline': callOutline,
            'calendar-outline': calendarOutline,
            'globe-outline': globeOutline,
            'id-card-outline': idCardOutline,
            'business-outline': businessOutline,
            'create-outline': createOutline,
            'arrow-back-outline': arrowBackOutline,
            'person-circle-outline': personCircleOutline,
            'finger-print-outline': fingerPrintOutline,
            'time-outline': timeOutline,
            'alert-circle-outline': alertCircleOutline
        });
    }

    ngOnInit() {
        const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
        if (id) {
            this.cargarUsuario(id);
        } else {
            this.navCtrl.back();
        }
    }

    cargarUsuario(id: number) {
        this.cargando = true;

        this.usuarioService.getUsuario(id).pipe(
            timeout(10000),
            finalize(() => {
                this.cargando = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (data) => {
                this.usuario = data;
            },
            error: (error) => {
                console.error('Error al cargar usuario:', error);
            }
        });
    }


    getTipoParticipanteLabel(tipo: number): string {
        const labels: { [key: number]: string } = {
            0: 'Ciudadano / Particular',
            1: 'Autoridad',
            2: 'Funcionario GAD',
            3: 'Institución del Sistema'
        };
        return labels[tipo] || 'No definido';
    }

    getInicial(nombre: string): string {
        return nombre ? nombre.charAt(0).toUpperCase() : '?';
    }

    regresar() {
        this.navCtrl.back();
    }
}
