import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { timeout, finalize } from 'rxjs';
import { addIcons } from 'ionicons';
import {
    personOutline, locationOutline, shieldCheckmarkOutline, mailOutline,
    callOutline, calendarOutline, globeOutline, idCardOutline,
    businessOutline, createOutline, arrowBackOutline, personCircleOutline,
    fingerPrintOutline, timeOutline, alertCircleOutline, lockClosedOutline, lockOpenOutline
} from 'ionicons/icons';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { Usuario } from 'src/app/core/models/usuario.interface';
import { RolEnum, TipoParticipanteEnum, NivelGobiernoEnum } from 'src/app/shared/constants/enums';
import { AlertController } from '@ionic/angular/standalone';

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
    private alertCtrl = inject(AlertController);
    private toastCtrl = inject(ToastController);

    usuario: Usuario | null = null;
    cargando = true;
    actualizando = false; // Add this for localized loading
    today = new Date();
    TipoParticipanteEnum = TipoParticipanteEnum;

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
            'alert-circle-outline': alertCircleOutline,
            'lock-closed-outline': lockClosedOutline,
            'lock-open-outline': lockOpenOutline
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

    getNivelGobiernoLabel(nivel: any): string {
        if (!nivel) return 'No definido';
        const n = Number(nivel);
        const labels: { [key: number]: string } = {
            [NivelGobiernoEnum.PROVINCIAL]: 'PROVINCIAL',
            [NivelGobiernoEnum.MUNICIPAL]: 'MUNICIPAL',
            [NivelGobiernoEnum.PARROQUIAL]: 'PARROQUIAL',
            [NivelGobiernoEnum.MANCOMUNIDADES]: 'MANCOMUNIDADES',
            [NivelGobiernoEnum.GREMIOS]: 'GREMIOS',
            [NivelGobiernoEnum.CENTRAL]: 'GOBIERNO CENTRAL',
            [NivelGobiernoEnum.COOPERANTES]: 'COOPERANTES',
            [NivelGobiernoEnum.ACADEMIA]: 'ACADEMIA',
            [NivelGobiernoEnum.EDUCACION]: 'EDUCACIÓN',
            [NivelGobiernoEnum.PRIVADO]: 'SECTOR PRIVADO',
            [NivelGobiernoEnum.CIUDADANIA]: 'CIUDADANÍA',
            [NivelGobiernoEnum.REGIMEN_ESPECIAL]: 'RÉGIMEN ESPECIAL'
        };
        return labels[n] || String(nivel);
    }

    getTipoParticipanteLabel(tipo: any): string {
        if (!tipo) return 'SIN TIPO';

        // Si es un objeto de la relación mapeada
        if (typeof tipo === 'object' && tipo.nombre) {
            return tipo.nombre.toUpperCase();
        }

        const t = Number(tipo);
        const labels: { [key: number]: string } = {
            [TipoParticipanteEnum.CIUDADANO]: 'CIUDADANO',
            [TipoParticipanteEnum.AUTORIDAD]: 'AUTORIDAD',
            [TipoParticipanteEnum.FUNCIONARIO_GAD]: 'FUNCIONARIO GAD',
            [TipoParticipanteEnum.INSTITUCION]: 'INSTITUCIÓN'
        };
        return labels[t] || 'SIN TIPO';
    }

    formatName(nombre: string | null | undefined, extra?: string | null | undefined): string {
        const parts = [nombre, extra].filter(val => val && val.toString().trim() !== '' && val !== 'null' && val !== 'undefined');
        return parts.length > 0 ? parts.join(' ') : '';
    }

    formatIdentification(ci: string): string {
        if (!ci) return '-';
        return ci;
    }

    getInicial(nombre: string): string {
        if (!nombre && this.usuario) nombre = this.getCleanFullName();
        if (!nombre) return 'J';
        const clean = nombre.replace(/\s*null\s*/g, ' ').trim();
        return clean ? clean.charAt(0).toUpperCase() : 'J';
    }

    getCleanFullName(): string {
        if (!this.usuario) return '';
        const user = this.usuario;
        if (user.primerNombre && user.primerApellido) {
            return [
                user.primerNombre,
                user.segundoNombre,
                user.primerApellido,
                user.segundoApellido
            ].filter(val => val && val.toString().trim() !== '' && val !== 'null' && val !== 'undefined').join(' ');
        }
        return (user.nombre || '').replace(/\s*null\s*/g, ' ').trim();
    }

    async toggleEstado() {
        if (!this.usuario) return;

        const nuevoEstado = this.usuario.estado === 1 ? 0 : 1;
        const msg = nuevoEstado === 1 ? '¿Desea activar esta cuenta?' : '¿Desea bloquear esta cuenta? El usuario no podrá iniciar sesión.';

        const alert = await this.alertCtrl.create({
            header: 'Cambiar Estado',
            message: msg,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: nuevoEstado === 1 ? 'Activar' : 'Bloquear',
                    handler: () => {
                        this.actualizando = true;
                        this.cdr.detectChanges(); // Local update

                        this.usuarioService.updateUsuario(this.usuario!.id, { estado: nuevoEstado })
                            .pipe(finalize(() => {
                                this.actualizando = false;
                                this.cdr.detectChanges();
                            }))
                            .subscribe({
                                next: (res) => {
                                    this.usuario!.estado = nuevoEstado;
                                    this.showToast(nuevoEstado === 1 ? 'Cuenta activada' : 'Cuenta bloqueada');
                                },
                                error: (err) => {
                                    console.error('Error al actualizar estado:', err);
                                    this.showToast('Error al actualizar el estado', 'danger');
                                }
                            });
                    }
                }
            ]
        });

        await alert.present();
    }

    private async showToast(message: string, color: string = 'success') {
        const toast = await this.toastCtrl.create({
            message,
            duration: 2000,
            color,
            position: 'bottom'
        });
        toast.present();
    }

    regresar() {
        this.navCtrl.back();
    }
}
