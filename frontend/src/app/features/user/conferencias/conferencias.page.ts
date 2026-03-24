import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { DetalleCapacitacionModalComponent } from './components/detalle-capacitacion-modal/detalle-capacitacion-modal.component';
import { CapacitacionesService } from '../../admin/capacitaciones/services/capacitaciones.service';
import { AuthService } from '../../auth/services/auth.service';
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-conferencias',
  templateUrl: './conferencias.page.html',
  styleUrls: ['./conferencias.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConferenciasPage implements OnInit {
  inscripciones: any[] = [];
  inscripcionesFiltradas: any[] = [];
  loading = false;
  errorMsg = '';

  searchTerm = '';
  filtroEstado = 'todos';

  private capacitacionesService = inject(CapacitacionesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  constructor() { }

  ngOnInit() {
    this.resolverYCargar();
  }

  /** Resuelve el userId de la sesión y lanza la carga */
  private resolverYCargar() {
    this.loading = true;
    this.cdr.markForCheck();

    // 1. Usar el signal del AuthService (Fuente de verdad actual)
    const user = this.authService.currentUser();
    if (user?.id) {
      console.log('[ConferenciasPage] Cargando para usuario:', user.id);
      this.cargarHistorial(user.id);
      return;
    }

    // 2. Fallback: Si el signal no está listo pero hay datos en localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userParsed = JSON.parse(storedUser);
        if (userParsed?.id) {
          this.cargarHistorial(userParsed.id);
          return;
        }
      } catch (e) {
        console.error('[ConferenciasPage] Error parseando usuario persistido');
      }
    }

    // 3. No hay sesión
    this.loading = false;
    this.errorMsg = 'No se detectó una sesión activa. Por favor, ingresa de nuevo.';
    this.cdr.detectChanges();
  }

  async cargarHistorial(userId: number) {
    this.loading = true;
    this.errorMsg = '';
    this.inscripciones = [];
    this.inscripcionesFiltradas = [];
    this.cdr.markForCheck();

    try {
      const data = await firstValueFrom(this.capacitacionesService.getInscripcionesUsuario(userId));
      this.inscripciones = Array.isArray(data) ? data : [];
      this.filtrarCapacitaciones();

      // Check for deep link ID
      const deepId = this.route.snapshot.queryParamMap.get('id');
      if (deepId) {
        const idNum = parseInt(deepId, 10);
        const match = this.inscripciones.find(i => (i.capacitacionId ?? i.Id_Capacitacion ?? i.capacitacion?.id) === idNum);
        if (match) {
          setTimeout(() => this.verDetallesCapacitacion(match), 500);
        }
      }
    } catch (err: any) {
      console.error('[ConferenciasPage] Error al cargar historial:', err);
      const status = err?.status;
      if (status === 401 || status === 403) {
        this.errorMsg = 'Sin autorización. Inicia sesión nuevamente.';
      } else if (status === 404) {
        this.errorMsg = 'Servicio no encontrado. Contacta al administrador.';
      } else {
        this.errorMsg = ErrorHandlerUtil.getErrorMessage(err);
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  recargar() {
    this.resolverYCargar();
  }

  /** Determina el estado real basándose en la fecha/hora actual */
  private calcularEstadoReal(inscripcion: any): string {
    const estadoInsc = inscripcion.estadoInscripcion;
    
    // Si ya está marcada como Finalizada, Cancelada o Rechazada explícitamente, respetar eso
    if (['Finalizada', 'Cancelada', 'Rechazada'].includes(estadoInsc)) {
      return estadoInsc;
    }

    const cap = inscripcion.capacitacion;
    if (!cap?.fechaInicio || !cap?.fechaFin) return estadoInsc;

    try {
      const hoy = new Date();
      const inicio = new Date(cap.fechaInicio);
      const fin = new Date(cap.fechaFin);
      
      // Normalizar para comparación solo por días
      const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
      const inicioSinHora = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime();
      const finSinHora = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate()).getTime();

      // 1. Caso: Ya terminó (Pasó el día de fin)
      if (hoySinHora > finSinHora) return 'Finalizada';

      // 2. Caso: Mismo día de fin
      if (hoySinHora === finSinHora) {
        if (cap.horaFin) {
          const [h, m] = cap.horaFin.split(':').map(Number);
          const fDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), h || 23, m || 59);
          if (hoy > fDate) return 'Finalizada';
        }
      }

      // 3. Caso: En Curso (Estamos entre inicio y fin)
      if (hoySinHora >= inicioSinHora && hoySinHora <= finSinHora) {
        // Podríamos refinar con horas aquí también, pero por ahora "Día de curso" = En Curso
        return 'En Curso';
      }

      // 4. Caso: Próximamente (El inicio es en el futuro)
      if (hoySinHora < inicioSinHora) {
        return 'Próximamente';
      }

    } catch (e) {
      console.error('[ConferenciasPage] Error calculando estado:', e);
    }

    return estadoInsc;
  }

  getCapacitacionesPorEstado(estado: string): number {
    return this.inscripciones.filter(i => {
      const realEst = this.calcularEstadoReal(i);
      if (estado === 'Pendiente') return realEst === 'Pendiente' || realEst === 'Aprobada';
      return realEst === estado;
    }).length;
  }

  getCapacitacionesConCertificado(): number {
    return this.inscripciones.filter(i =>
      i.capacitacion?.certificado === true && this.calcularEstadoReal(i) === 'Finalizada'
    ).length;
  }

  filtrarCapacitaciones() {
    let resultado = this.inscripciones.map(i => ({
      ...i,
      estadoReal: this.calcularEstadoReal(i)
    }));

    if (this.searchTerm?.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      resultado = resultado.filter(i =>
        i.capacitacion?.nombre?.toLowerCase().includes(term)
      );
    }

    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(i => {
        if (this.filtroEstado === 'Pendiente') {
          return i.estadoReal === 'Pendiente' || i.estadoReal === 'Aprobada';
        }
        return i.estadoReal === this.filtroEstado;
      });
    }

    this.inscripcionesFiltradas = resultado;
  }

  async verDetallesCapacitacion(inscripcion: any) {
    const modal = await this.modalController.create({
      component: DetalleCapacitacionModalComponent,
      componentProps: {
        capacitacion: inscripcion.capacitacion,
        inscripcion: inscripcion
      },
      cssClass: 'professional-modal-class' // Optional: for custom styling
    });
    return await modal.present();
  }

  iraGenerarCertificado(idCapacitacion: number) {
    this.router.navigate(['/mis-certificados'], { queryParams: { idCapacitacion } });
  }
}
