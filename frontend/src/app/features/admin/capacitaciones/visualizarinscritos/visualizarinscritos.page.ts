import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertController, ToastController, NavController, LoadingController, ModalController } from '@ionic/angular';
import { CapacitacionesService } from 'src/app/features/admin/capacitaciones/services/capacitaciones.service';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
import { EstadoCapacitacionEnum, RolCapacitacionEnum } from 'src/app/shared/constants/enums';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { Router } from '@angular/router';
import { Capacitacion } from 'src/app/core/models/capacitacion.interface';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  informationCircleOutline, 
  calendarOutline, 
  locationOutline, 
  timeOutline, 
  peopleOutline, 
  desktopOutline, 
  linkOutline, 
  barChart, 
  people, 
  checkmarkDone, 
  close, 
  closeCircle, 
  analyticsOutline, 
  qrCodeOutline, 
  searchOutline, 
  checkmarkDoneOutline, 
  personAddOutline, 
  cloudDownloadOutline, 
  person, 
  businessOutline, 
  trashOutline, 
  ribbonOutline, 
  shieldCheckmark, 
  checkmarkCircle,
  micOutline,
  peopleCircleOutline,
  hourglassOutline,
  speedometerOutline,
  listOutline,
  time
} from 'ionicons/icons';

interface ParticipanteInfo {
  id: number;
  usuarioId: number;
  nombre: string;
  rolCapacitacion: string;
  asistio: boolean;
  email?: string;
  entidad?: string;
}

@Component({
  selector: 'app-visualizarinscritos',
  templateUrl: './visualizarinscritos.page.html',
  styleUrls: ['./visualizarinscritos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizarinscritosPage implements OnInit {
  idCapacitacion: number | null = null;
  infoCapacitacion: Capacitacion | null = null;

  /** Todos los inscritos excepto expositores */
  participantes: ParticipanteInfo[] = [];
  /** Solo expositores/ponentes */
  expositores: ParticipanteInfo[] = [];
  /** Resultado filtrado para mostrar en la tabla */
  participantesFiltrados: ParticipanteInfo[] = [];

  cargando = true;

  // Filtros
  terminoBusqueda = '';
  filtroAsistencia = 'todos';

  // QR modal
  mostrarQREvento = false;
  qrDataUrl = '';
  generandoQR = false;

  // Modal agregar participante
  mostrandoModalAgregar = false;
  usuariosDisponibles: any[] = [];
  cargandoUsuariosDisponibles = false;
  busquedaUsuarioDisponible = '';
  usuariosDisponiblesFiltrados: any[] = [];
  usuarioSeleccionadoId: number | null = null;
  rolSeleccionado: string = RolCapacitacionEnum.PARTICIPANTE;

  private capacitacionesService = inject(CapacitacionesService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isConferencista = this.authService.roleName() === 'Conferencista';

  readonly RolCapacitacionEnum = RolCapacitacionEnum;
  readonly EstadoCapacitacionEnum = EstadoCapacitacionEnum;

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController,
    private loadingController: LoadingController,
    private router: Router
  ) {
    addIcons({
      arrowBackOutline,
      informationCircleOutline,
      calendarOutline,
      locationOutline,
      timeOutline,
      peopleOutline,
      desktopOutline,
      linkOutline,
      barChart,
      people,
      checkmarkDone,
      close,
      closeCircle,
      analyticsOutline,
      qrCodeOutline,
      searchOutline,
      checkmarkDoneOutline,
      personAddOutline,
      cloudDownloadOutline,
      person,
      businessOutline,
      trashOutline,
      ribbonOutline,
      shieldCheckmark,
      checkmarkCircle,
      micOutline,
      peopleCircleOutline,
      hourglassOutline,
      speedometerOutline,
      listOutline,
      time
    });
  }

  ngOnInit() {
    const idCapacitacion = +this.activatedRoute.snapshot.params['id'];
    this.idCapacitacion = idCapacitacion;

    if (!isNaN(this.idCapacitacion) && this.idCapacitacion > 0) {
      this.cargarDatos();
    } else {
      this.mostrarToast('ID de capacitación no válido', 'danger');
      const prefix = this.router.url.includes('/conferencista/') ? '/conferencista' : '';
      this.navController.navigateBack(`${prefix}/gestionar-capacitaciones`);
    }
  }

  async cargarDatos() {
    this.cargando = true;
    this.cdr.markForCheck();
    try {
      // Carga paralela: info de capacitación + inscritos
      const [capacitacion, inscritos] = await Promise.all([
        firstValueFrom(this.capacitacionesService.getCapacitacion(this.idCapacitacion!)),
        firstValueFrom(this.capacitacionesService.getInscritos(this.idCapacitacion!))
      ]);

      this.infoCapacitacion = capacitacion;
      this.procesarInscritos(inscritos);
      this.filtrarParticipantes();
    } catch (error) {
      this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  private procesarInscritos(inscritos: any[]) {
    const mappedUsuarios: ParticipanteInfo[] = inscritos.map((u: any) => ({
      id: u.id,
      usuarioId: u.usuarioId,
      nombre: u.usuario?.nombre || 'Sin nombre',
      rolCapacitacion: u.rolCapacitacion,
      asistio: u.asistio,
      email: u.usuario?.email,
      entidad: u.usuario?.entidad?.nombre
    }));

    this.expositores = mappedUsuarios.filter(u => u.rolCapacitacion === RolCapacitacionEnum.EXPOSITOR);
    this.participantes = mappedUsuarios.filter(u => u.rolCapacitacion !== RolCapacitacionEnum.EXPOSITOR);
  }

  // --- Filtros ---

  filtrarParticipantes() {
    let resultado = [...this.participantes];

    if (this.terminoBusqueda?.trim()) {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      resultado = resultado.filter(u =>
        u.nombre?.toLowerCase().includes(termino) ||
        u.rolCapacitacion?.toLowerCase().includes(termino) ||
        u.entidad?.toLowerCase().includes(termino)
      );
    }

    if (this.filtroAsistencia === 'asistentes') {
      resultado = resultado.filter(u => u.asistio === true);
    } else if (this.filtroAsistencia === 'ausentes') {
      resultado = resultado.filter(u => u.asistio === false);
    }

    this.participantesFiltrados = resultado;
    this.cdr.markForCheck();
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.filtroAsistencia = 'todos';
    this.filtrarParticipantes();
  }

  // --- Estadísticas ---

  get totalAsistentes(): number {
    return this.participantes.filter(u => u.asistio).length;
  }

  get porcentajeAsistencia(): number {
    if (this.participantes.length === 0) return 0;
    return Math.round((this.totalAsistentes / this.participantes.length) * 100);
  }

  /** Código corto legible: primeros 8 chars del UUID en mayúsculas (sin guiones) */
  get codigoAcceso(): string {
    if (!this.infoCapacitacion?.codigoQrEvento) return '';
    return this.infoCapacitacion.codigoQrEvento.replace(/-/g, '').substring(0, 8).toUpperCase();
  }

  // --- Asistencia manual ---

  async actualizarAsistencia(participante: ParticipanteInfo) {
    try {
      await firstValueFrom(this.capacitacionesService.updateAttendance(participante.id, participante.asistio));
      this.filtrarParticipantes();
      this.mostrarToast(`Asistencia ${participante.asistio ? 'confirmada' : 'removida'} para ${participante.nombre}`, 'success');
    } catch (error) {
      // Revertir el toggle si falló
      participante.asistio = !participante.asistio;
      this.cdr.markForCheck();
      this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    }
  }

  async marcarTodosAsistieron() {
    if (!this.idCapacitacion) return;
    const alert = await this.alertController.create({
      header: 'Confirmar acción',
      message: `¿Confirmar asistencia para los ${this.participantes.length} participantes?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar todos',
          handler: async () => {
            try {
              await firstValueFrom(this.capacitacionesService.updateAllAttendance(this.idCapacitacion!, true));
              this.participantes.forEach(p => p.asistio = true);
              this.filtrarParticipantes();
              this.mostrarToast('Todos los participantes marcados como asistentes', 'success');
            } catch (error) {
              this.mostrarToast('Error al actualizar asistencia masiva', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // --- QR del evento ---

  async mostrarQRDelEvento() {
    if (!this.infoCapacitacion?.codigoQrEvento) {
      this.mostrarToast('Esta capacitación no tiene un código QR generado', 'warning');
      return;
    }

    this.generandoQR = true;
    this.mostrarQREvento = true;
    this.cdr.markForCheck();

    try {
      // Generar QR usando API externa (QR code server)
      const qrContent = this.infoCapacitacion.codigoQrEvento;
      const qrSize = 300;
      this.qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrContent)}&margin=10&format=png`;
    } finally {
      this.generandoQR = false;
      this.cdr.markForCheck();
    }
  }

  cerrarQRModal() {
    this.mostrarQREvento = false;
    this.cdr.markForCheck();
  }

  // --- Modal Agregar Participante ---

  async abrirModalAgregar() {
    // Solo cargar usuarios disponibles cuando se abre el modal
    this.mostrandoModalAgregar = true;
    this.usuarioSeleccionadoId = null;
    this.rolSeleccionado = RolCapacitacionEnum.PARTICIPANTE;
    this.busquedaUsuarioDisponible = '';
    this.cdr.markForCheck();

    await this.cargarUsuariosDisponibles();
  }

  cerrarModalAgregar() {
    this.mostrandoModalAgregar = false;
    this.usuariosDisponibles = [];
    this.usuariosDisponiblesFiltrados = [];
    this.cdr.markForCheck();
  }

  private async cargarUsuariosDisponibles() {
    this.cargandoUsuariosDisponibles = true;
    this.cdr.markForCheck();
    try {
      const todosUsuarios = await firstValueFrom(this.usuarioService.getUsuarios());
      const idsInscritos = new Set([
        ...this.expositores.map(u => u.usuarioId),
        ...this.participantes.map(u => u.usuarioId)
      ]);
      this.usuariosDisponibles = (todosUsuarios || [])
        .filter((u: any) => !idsInscritos.has(u.id))
        .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
      this.filtrarUsuariosDisponibles();
    } catch (error) {
      this.mostrarToast('Error al cargar usuarios disponibles', 'warning');
    } finally {
      this.cargandoUsuariosDisponibles = false;
      this.cdr.markForCheck();
    }
  }

  filtrarUsuariosDisponibles() {
    if (!this.busquedaUsuarioDisponible?.trim()) {
      this.usuariosDisponiblesFiltrados = [...this.usuariosDisponibles];
    } else {
      const termino = this.busquedaUsuarioDisponible.toLowerCase();
      this.usuariosDisponiblesFiltrados = this.usuariosDisponibles.filter((u: any) =>
        u.nombre?.toLowerCase().includes(termino) ||
        u.ci?.toLowerCase().includes(termino)
      );
    }
    this.cdr.markForCheck();
  }

  async guardarNuevoParticipante() {
    if (!this.idCapacitacion || !this.usuarioSeleccionadoId) {
      this.mostrarToast('Selecciona un usuario para continuar', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Agregando participante...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await firstValueFrom(
        this.capacitacionesService.assignUser(this.idCapacitacion, this.usuarioSeleccionadoId, this.rolSeleccionado)
      );

      // Recargar la lista de inscritos desde el servidor para tener datos frescos
      const inscritos = await firstValueFrom(this.capacitacionesService.getInscritos(this.idCapacitacion));
      this.procesarInscritos(inscritos);
      this.filtrarParticipantes();

      this.cerrarModalAgregar();
      this.mostrarToast('Participante agregado correctamente', 'success');
    } catch (error) {
      this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // --- Eliminar participante ---

  async confirmarEliminar(participante: ParticipanteInfo) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Eliminar a ${participante.nombre} de la lista de participantes?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminarParticipante(participante)
        }
      ]
    });
    await alert.present();
  }

  private async eliminarParticipante(participante: ParticipanteInfo) {
    try {
      await firstValueFrom(this.capacitacionesService.deleteUsuarioCapacitacion(participante.id));
      this.participantes = this.participantes.filter(u => u.id !== participante.id);
      this.filtrarParticipantes();
      this.mostrarToast('Participante eliminado correctamente', 'success');
    } catch (error) {
      this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    }
  }

  // --- Certificados ---

  async mostrarConfirmacionCertificados() {
    const noAsistieron = this.participantes.filter(u => !u.asistio).length;
    const alert = await this.alertController.create({
      header: 'Emitir Certificados',
      message: `Se emitirán certificados para <strong>${this.totalAsistentes} asistentes</strong>. ${noAsistieron > 0 ? `Los ${noAsistieron} participantes que no asistieron no recibirán certificado.` : ''} Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Emitir certificados',
          handler: () => this.emitirCertificados()
        }
      ]
    });
    await alert.present();
  }

  async emitirCertificados() {
    if (!this.idCapacitacion) return;
    const loading = await this.loadingController.create({
      message: 'Generando certificados y códigos QR...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Marcar certificado emitido y generar todos en paralelo
      await Promise.all([
        firstValueFrom(this.capacitacionesService.updateCapacitacion(this.idCapacitacion, { certificado: true })),
        firstValueFrom(this.capacitacionesService.generateAllCertificates(this.idCapacitacion))
      ]);

      if (this.infoCapacitacion) {
        this.infoCapacitacion = { ...this.infoCapacitacion, certificado: true };
      }
      this.cdr.markForCheck();
      this.mostrarToast('Certificados emitidos correctamente', 'success');
    } catch (error) {
      this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // --- Exportar lista ---

  exportarLista() {
    if (this.participantesFiltrados.length === 0) return;

    try {
      const headers = ['Nombre', 'Asistencia', 'Rol', 'Email', 'Entidad'];
      const rows = this.participantesFiltrados.map(u => [
        u.nombre,
        u.asistio ? 'Asistió' : 'No asistió',
        u.rolCapacitacion || 'Participante',
        u.email || '-',
        u.entidad || '-'
      ]);

      let csv = 'data:text/csv;charset=utf-8,\uFEFF';
      csv += headers.join(',') + '\r\n';
      rows.forEach(row => {
        csv += row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',') + '\r\n';
      });

      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csv));
      link.setAttribute('download', `participantes-${this.infoCapacitacion?.nombre || 'capacitacion'}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.mostrarToast('Lista exportada correctamente', 'success');
    } catch (error) {
      this.mostrarToast('Error al exportar la lista', 'danger');
    }
  }

  // --- Estado ---

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case EstadoCapacitacionEnum.PENDIENTE: return 'Pendiente';
      case EstadoCapacitacionEnum.REALIZADA: return 'Finalizada';
      case EstadoCapacitacionEnum.CANCELADA: return 'Cancelada';
      default: return estado;
    }
  }

  // --- Navegación ---

  volver() {
    if (this.isConferencista) {
      this.router.navigate(['/conferencista/gestionar-capacitaciones']);
    } else {
      this.router.navigate(['/gestionar-capacitaciones']);
    }
  }

  // --- Toast ---

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color,
      buttons: [{ text: 'Cerrar', role: 'cancel' }]
    });
    await toast.present();
  }

  abrirMapa(lugar: string) {
    if (!lugar) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`;
    window.open(url, '_blank');
  }
}
