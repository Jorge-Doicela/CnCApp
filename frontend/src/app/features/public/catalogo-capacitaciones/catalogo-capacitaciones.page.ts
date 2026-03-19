import { Component, OnInit, inject, signal, ChangeDetectorRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonHeader, IonToolbar, IonSpinner, ToastController, LoadingController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, searchOutline, calendarClearOutline, calendarOutline, 
  timeOutline, locationOutline, checkmarkCircle, sparklesOutline, chevronForward 
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CapacitacionesService } from '../../admin/capacitaciones/services/capacitaciones.service';
import { AuthService } from '../../auth/services/auth.service';
import { Capacitacion } from '../../../core/models/capacitacion.interface';

@Component({
  selector: 'app-catalogo-capacitaciones',
  templateUrl: './catalogo-capacitaciones.page.html',
  styleUrls: ['./catalogo-capacitaciones.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonHeader, IonToolbar, IonSpinner]
})
export class CatalogoCapacitacionesPage implements OnInit {
  private capacitacionesService = inject(CapacitacionesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);

  capacitaciones = signal<Capacitacion[]>([]);
  query = signal<string>('');
  cargandoCapacitaciones = signal<boolean>(false);
  conferenciasInscritas = signal<Capacitacion[]>([]);

  capacitacionesFiltradas = computed(() => {
    const q = this.query().toLowerCase();
    return this.capacitaciones().filter(c => 
      c.nombre.toLowerCase().includes(q) || 
      c.descripcion?.toLowerCase().includes(q) ||
      c.lugar?.toLowerCase().includes(q)
    );
  });

  constructor() {
    addIcons({
      arrowBackOutline, searchOutline, calendarClearOutline, calendarOutline,
      timeOutline, locationOutline, checkmarkCircle, sparklesOutline, chevronForward
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.cargandoCapacitaciones.set(true);
    try {
      const all = await firstValueFrom(this.capacitacionesService.getCapacitaciones());
      this.capacitaciones.set((all ?? []).filter(c => c.estado === 'Activa'));
      
      if (this.authService.isAuthenticated()) {
        await this.recuperarInscripciones();
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
    } finally {
      this.cargandoCapacitaciones.set(false);
      this.cd.markForCheck();
    }
  }

  async recuperarInscripciones() {
    const user = this.authService.currentUser();
    const userId = user?.id ?? parseInt(localStorage.getItem('auth_uid') ?? '', 10);
    if (!userId) return;

    try {
      const inscripciones = await firstValueFrom(this.capacitacionesService.getInscripcionesUsuario(userId)) as any[];
      const ids = (inscripciones ?? []).map(i => i.capacitacionId ?? i.Id_Capacitacion);
      this.conferenciasInscritas.set(this.capacitaciones().filter(c => ids.includes(c.id)));
    } catch (error) {
      console.error('Error al recuperar inscripciones:', error);
    }
  }

  isInscrito(id: number) {
    return this.conferenciasInscritas().some(c => c.id === id);
  }

  haIniciado(cap: Capacitacion) {
    if (!cap.fechaInicio) return false;
    const ahora = new Date();
    const fechaHoraInicio = new Date(cap.fechaInicio);
    if (cap.horaInicio) {
      const [h, m] = cap.horaInicio.split(':').map(Number);
      fechaHoraInicio.setHours(h ?? 0, m ?? 0, 0, 0);
    } else {
      fechaHoraInicio.setHours(0, 0, 0, 0);
    }
    return ahora >= fechaHoraInicio;
  }

  async inscribirse(idCapacitacion: number) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const loading = await this.loadingController.create({ message: 'Procesando inscripción...', spinner: 'crescent' });
    await loading.present();

    try {
      const user = this.authService.currentUser();
      const idUsuario = user?.id ?? parseInt(localStorage.getItem('auth_uid') ?? '', 10);
      await firstValueFrom(this.capacitacionesService.inscribirse(idUsuario, idCapacitacion) as any);
      
      const toast = await this.toastController.create({ message: 'Inscripción exitosa', duration: 2000, color: 'success', position: 'top' });
      toast.present();
      
      await this.recuperarInscripciones();
    } catch (e: any) {
      const msg = e.error?.message || 'Error al inscribirse';
      const toast = await this.toastController.create({ message: msg, duration: 2000, color: 'danger', position: 'top' });
      toast.present();
    } finally {
      loading.dismiss();
      this.cd.markForCheck();
    }
  }

  onSearch(event: any) {
    this.query.set(event.target.value);
  }

  resetSearch() {
    this.query.set('');
  }

  irAHome() {
    this.router.navigate(['/home']);
  }

  irAMisCursos() {
    this.router.navigate(['/ver-conferencias']);
  }
}
