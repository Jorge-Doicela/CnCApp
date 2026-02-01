import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CapacitacionesService } from '../../admin/capacitaciones/services/capacitaciones.service';
import { AuthService } from '../../auth/services/auth.service';
import { UsuarioCapacitacion } from '../../../core/models/capacitacion.interface';

@Component({
  selector: 'app-conferencias',
  templateUrl: './conferencias.page.html',
  styleUrls: ['./conferencias.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ConferenciasPage implements OnInit {
  inscripciones: any[] = [];
  inscripcionesFiltradas: any[] = [];
  loading: boolean = true;
  currentUser: any = null;

  searchTerm: string = '';
  filtroEstado: string = 'todos';

  private capacitacionesService = inject(CapacitacionesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  constructor() { }

  async ngOnInit() {
    const user = this.authService.currentUser();
    this.currentUser = user;
    if (user) {
      this.cargarHistorial(user.id);
    }
  }

  cargarHistorial(userId: number) {
    this.loading = true;
    this.capacitacionesService.getInscripcionesUsuario(userId).subscribe({
      next: (data) => {
        // Data is UsuarioCapacitacion, we might need to join with Capacitacion details
        // Assuming the backend returns the nested relations or we map it.
        // If the interface UsuarioCapacitacion has 'capacitacion' relation populated:
        this.inscripciones = data;
        this.filtrarCapacitaciones();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getCapacitacionesConCertificado(): number {
    return this.inscripciones.filter(i => i.capacitacion?.certificado === true && i.estadoInscripcion === 'Finalizada').length;
  }

  getCapacitacionesPorEstado(estado: string): number {
    return this.inscripciones.filter(i => i.estadoInscripcion === estado).length;
  }

  filtrarCapacitaciones() {
    let resultado = [...this.inscripciones];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const termino = this.searchTerm.toLowerCase().trim();
      resultado = resultado.filter(i =>
        i.capacitacion?.nombre?.toLowerCase().includes(termino)
      );
    }

    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(i => i.estadoInscripcion === this.filtroEstado);
    }

    this.inscripcionesFiltradas = resultado;
  }

  async verDetallesCapacitacion(inscripcion: any) {
    const cap = inscripcion.capacitacion;
    if (!cap) return;

    const alert = await this.alertController.create({
      header: cap.nombre,
      subHeader: `Inscrito el: ${new Date(inscripcion.fechaInscripcion).toLocaleDateString()}`,
      message: `
        <div style="text-align: left;">
          <p><strong>Descripción:</strong> ${cap.descripcion || 'Sin descripción'}</p>
          <p><strong>Modalidad:</strong> ${cap.modalidad || 'N/A'}</p>
          <p><strong>Estado Inscripción:</strong> ${inscripcion.estadoInscripcion}</p>
          <p><strong>Asistencia:</strong> ${inscripcion.asistio ? 'Sí' : 'No'}</p>
        </div>
      `,
      buttons: ['OK']
    });

    await alert.present();
  }

  iraGenerarCertificado(idCapacitacion: number) {
    this.router.navigate(['/ver-certificaciones', { id: idCapacitacion }]); // Or direct
    // Actually requirement says "Visualiza y descarga desde lista".
    // We can navigate to the certifications tab or open specific one.
    // Let's assume we navigate to the Certificaciones page which will show the PDF.
    this.router.navigate(['/ver-certificaciones'], { queryParams: { idCapacitacion } });
  }
}
