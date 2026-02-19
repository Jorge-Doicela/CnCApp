import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Component, OnInit, inject } from '@angular/core';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personOutline, idCardOutline, callOutline, calendarOutline, maleFemaleOutline,
  peopleOutline, flagOutline, globeOutline, locationOutline, shieldCheckmarkOutline,
  keyOutline, businessOutline, powerOutline, createOutline, trashOutline,
  cloudUploadOutline, saveOutline, arrowBackOutline, homeOutline,
  cardOutline, shieldOutline
} from 'ionicons/icons';
import { UsuarioService } from 'src/app/features/user/services/usuario.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EditarPage implements OnInit {
  segmentoActual: string = 'personal';

  usuario = {
    id: '',
    email: '',
    password: '', // Usually not changed here but kept for structure
    nombre1: '',
    nombre2: '',
    apellido1: '',
    apellido2: '',
    nombre: '',
    ci: '',
    rolId: undefined as number | undefined,
    entidadId: undefined as number | undefined,
    estado: 1,
    firmaUrl: '',
    celular: '',
    convencional: '',
    genero: '',
    etnia: '',
    nacionalidad: '',
    tipoParticipante: 0,
    fechaNacimiento: '',
    cantonReside: '',
    parroquiaReside: '',
    // Auxiliar para UI
    Firma_Usuario_Imagen: null as any
  };

  // Objetos para tipos específicos
  autoridad = { cargo: '', nivelgobierno: '', gadAutoridad: '' };
  funcionarioGad = { cargo: '', competencias: '', nivelgobierno: '', gadFuncionarioGad: '' };
  institucion = { institucion: '', gradoOcupacional: '', cargo: '' };

  datosrecuperados = {
    roles: [] as any[],
    cargos: [] as any[],
    instituciones: [] as any[],
    provincias: [] as any[],
    cantones: [] as any[],
    parroquias: [] as any[],
  };

  datosbusqueda = {
    selectedProvincia: 0
  };

  cargando: boolean = false;

  private usuarioService = inject(UsuarioService);
  private catalogoService = inject(CatalogoService);

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    console.log('[ADMIN_EDITAR_DEBUG] Constructor iniciado');
    addIcons({
      'person-outline': personOutline,
      'id-card-outline': idCardOutline,
      'call-outline': callOutline,
      'calendar-outline': calendarOutline,
      'male-female-outline': maleFemaleOutline,
      'people-outline': peopleOutline,
      'flag-outline': flagOutline,
      'globe-outline': globeOutline,
      'location-outline': locationOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'key-outline': keyOutline,
      'business-outline': businessOutline,
      'power-outline': powerOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'cloud-upload-outline': cloudUploadOutline,
      'save-outline': saveOutline,
      'arrow-back-outline': arrowBackOutline,
      'home-outline': homeOutline,
      'card-outline': cardOutline,
      'shield-outline': shieldOutline
    });
  }

  async ngOnInit() {
    console.log('[ADMIN_EDITAR_DEBUG] ngOnInit iniciado');

    // Don't await - let it run in background
    this.mostrarCargando('Cargando información...').then(() => {
      console.log('[ADMIN_EDITAR_DEBUG] Loading dialog shown');
    }).catch(err => {
      console.error('[ADMIN_EDITAR_DEBUG] Error showing loading:', err);
    });

    console.log('[ADMIN_EDITAR_DEBUG] After mostrarCargando call');

    this.obtenerRoles();
    console.log('[ADMIN_EDITAR_DEBUG] After obtenerRoles');
    this.obtenerProvincias();
    console.log('[ADMIN_EDITAR_DEBUG] After obtenerProvincias');
    this.obtenerCargos();
    console.log('[ADMIN_EDITAR_DEBUG] After obtenerCargos');
    this.obtenerInstituciones();
    console.log('[ADMIN_EDITAR_DEBUG] After obtenerInstituciones');

    const userId = +this.activatedRoute.snapshot.params['id'];
    console.log('[ADMIN_EDITAR_DEBUG] userId from route:', userId);
    if (isNaN(userId)) {
      console.log('[ADMIN_EDITAR_DEBUG] userId is NaN - showing error');
      this.ocultarCargando();
      this.presentToast('ID de usuario inválido', 'danger');
      return;
    }

    this.usuario.id = userId.toString();
    console.log('[ADMIN_EDITAR_DEBUG] Calling cargarUsuario with ID:', userId);
    this.cargarUsuario(userId);
    console.log('[ADMIN_EDITAR_DEBUG] ngOnInit completed');
  }

  cargarUsuario(id: number) {
    console.log('[ADMIN_EDITAR_DEBUG] cargarUsuario called with ID:', id);
    this.usuarioService.getUsuario(id).subscribe({
      next: (data) => {
        console.log('[ADMIN_EDITAR_DEBUG] Usuario data received:', data);
        if (!data) {
          console.log('[ADMIN_EDITAR_DEBUG] No data received');
          this.ocultarCargando();
          this.presentToast('No se encontró el usuario', 'warning');
          return;
        }

        // Mapeo detallado similar a CrearPage
        this.usuario = {
          ...this.usuario,
          id: data.id.toString(),
          email: data.email || '',
          nombre1: data.nombre1 || '',
          nombre2: data.nombre2 || '',
          apellido1: data.apellido1 || '',
          apellido2: data.apellido2 || '',
          nombre: data.nombre || '',
          ci: data.ci || '',
          rolId: data.rolId,
          entidadId: data.entidadId,
          estado: (data as any).estado ?? 1,
          firmaUrl: data.firmaUrl || '',
          celular: data.celular || '',
          convencional: data.convencional || '',
          genero: data.genero || '',
          etnia: data.etnia || '',
          nacionalidad: data.nacionalidad || '',
          tipoParticipante: Number(data.tipoParticipante) || 0,
          fechaNacimiento: data.fechaNacimiento || '',
          cantonReside: data.cantonReside || '',
          parroquiaReside: data.parroquiaReside || '',
        };

        // Cargar ubicación si existe
        if (this.usuario.cantonReside) {
          this.detectarProvinciaDesdeCanton();
        }

        // Cargar datos específicos si existen
        if (data.autoridad) this.autoridad = { ...data.autoridad };
        if (data.funcionarioGad) this.funcionarioGad = { ...data.funcionarioGad };
        if (data.institucion) this.institucion = { ...data.institucion };

        console.log('[ADMIN_EDITAR_DEBUG] Usuario loaded successfully, hiding loading');
        this.ocultarCargando();
      },
      error: (error) => {
        console.error('[ADMIN_EDITAR_DEBUG] Error al cargar usuario:', error);
        this.ocultarCargando();
        console.error('Error al cargar usuario:', error);
        this.presentToast('Error al cargar los datos del usuario', 'danger');
      }
    });
  }

  obtenerRoles() {
    this.catalogoService.getItems('rol').subscribe({
      next: (data) => this.datosrecuperados.roles = data || [],
      error: (error) => console.error('Error al obtener roles:', error)
    });
  }

  obtenerProvincias() {
    this.catalogoService.getItems('provincias').subscribe({
      next: (data) => this.datosrecuperados.provincias = data || [],
      error: (error) => console.error('Error provincias:', error)
    });
  }

  cambioProvincia() {
    this.usuario.cantonReside = '';
    this.usuario.parroquiaReside = '';
    this.datosrecuperados.cantones = [];
    this.datosrecuperados.parroquias = [];

    if (this.datosbusqueda.selectedProvincia) {
      this.cargarCantones(this.datosbusqueda.selectedProvincia);
    }
  }

  cargarCantones(provinciaId: number) {
    if (!provinciaId) return;
    this.catalogoService.getItems('cantones').subscribe({
      next: (data) => {
        this.datosrecuperados.cantones = data.filter((c: any) => c.provinciaId == provinciaId);
        // Si ya teníamos un cantón (al cargar el usuario), cargamos sus parroquias
        if (this.usuario.cantonReside) {
          this.cargarParroquias(this.usuario.cantonReside);
        }
      },
      error: (err) => console.error(err)
    });
  }

  cambioCanton() {
    this.usuario.parroquiaReside = '';
    this.datosrecuperados.parroquias = [];
    if (this.usuario.cantonReside) {
      this.cargarParroquias(this.usuario.cantonReside);
    }
  }

  cargarParroquias(cantonId: string) {
    if (!cantonId) return;
    this.catalogoService.getItems('parroquias').subscribe({
      next: (data) => {
        this.datosrecuperados.parroquias = data.filter((p: any) => p.cantonId == cantonId);
      },
      error: (err) => console.error(err)
    });
  }

  private detectarProvinciaDesdeCanton() {
    // Logic to auto-select province if user has canton logic required fetching all cantones and finding the one.
    // For now, we load all cantones and finding the one matching user.cantonReside
    this.catalogoService.getItems('cantones').subscribe({
      next: (data) => {
        const canton = data.find((c: any) => c.id == this.usuario.cantonReside);
        if (canton) {
          this.datosbusqueda.selectedProvincia = canton.provinciaId;
          this.cargarCantones(canton.provinciaId);
        }
      }
    });
  }

  obtenerCargos() {
    this.catalogoService.getItems('cargos').subscribe({
      next: (data) => this.datosrecuperados.cargos = data || [],
      error: (error) => console.error('Error cargos:', error)
    });
  }

  obtenerInstituciones() {
    this.catalogoService.getItems('instituciones_sistema').subscribe({
      next: (data) => this.datosrecuperados.instituciones = data || [],
      error: (error) => console.error('Error instituciones:', error)
    });
  }


  seleccionarFirma(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamaño del archivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.presentToast('El tamaño de la firma no debe exceder 2MB', 'warning');
      return;
    }

    // Validar tipo de archivo
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.presentToast('Solo se permiten archivos JPG o PNG', 'warning');
      return;
    }

    this.usuario.Firma_Usuario_Imagen = file;

    // Preview de la imagen
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.usuario.firmaUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  eliminarFirma() {
    this.usuario.firmaUrl = '';
    this.usuario.Firma_Usuario_Imagen = null;
  }

  async actualizarUsuario() {
    if (!this.validarFormulario()) {
      return;
    }

    await this.mostrarCargando('Guardando cambios...');

    const datosAEnviar = {
      ...this.usuario,
      autoridad: this.usuario.tipoParticipante == 1 ? this.autoridad : null,
      funcionarioGad: this.usuario.tipoParticipante == 2 ? this.funcionarioGad : null,
      institucion: this.usuario.tipoParticipante == 3 ? this.institucion : null
    };

    this.usuarioService.updateUsuario(Number(this.usuario.id), datosAEnviar as any).subscribe({
      next: async () => {
        this.ocultarCargando();
        await this.mostrarAlertaExito('Usuario actualizado correctamente');
        this.router.navigate(['/gestionar-usuarios']);
      },
      error: (error) => {
        this.ocultarCargando();
        console.error('Error al actualizar usuario:', error);
        this.presentToast('Error al guardar los cambios: ' + (error.error?.message || error.message), 'danger');
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.usuario.nombre?.trim()) {
      this.presentToast('El nombre es obligatorio', 'warning');
      return false;
    }

    if (!this.usuario.ci?.trim()) {
      this.presentToast('La cédula es obligatoria', 'warning');
      return false;
    }

    if (!this.usuario.rolId) {
      this.presentToast('Debe seleccionar un rol', 'warning');
      return false;
    }

    return true;
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  async mostrarAlertaExito(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Operación Exitosa',
      message: mensaje,
      cssClass: 'success-alert',
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  async mostrarCargando(mensaje: string = 'Cargando...') {
    this.cargando = true;
    const loading = await this.loadingController.create({
      message: mensaje,
      spinner: 'circles'
    });
    await loading.present();
  }

  async ocultarCargando() {
    this.cargando = false;
    try {
      await this.loadingController.dismiss();
    } catch (error) {
      console.log('No hay cargando que cerrar');
    }
  }
}
