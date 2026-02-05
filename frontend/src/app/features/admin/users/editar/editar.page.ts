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
    await this.mostrarCargando('Cargando información...');
    this.obtenerRoles();
    this.obtenerProvincias();
    this.obtenerCargos();
    this.obtenerInstituciones();

    const userId = +this.activatedRoute.snapshot.params['id'];
    if (isNaN(userId)) {
      this.ocultarCargando();
      this.presentToast('ID de usuario inválido', 'danger');
      return;
    }

    this.usuario.id = userId.toString();
    this.cargarUsuario(userId);
  }

  cargarUsuario(id: number) {
    this.usuarioService.getUsuario(id).subscribe({
      next: (data) => {
        if (!data) {
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

        this.ocultarCargando();
      },
      error: (error) => {
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
    this.catalogoService.getItems(`cantones/provincia/${provinciaId}`).subscribe({
      next: (data) => {
        this.datosrecuperados.cantones = data || [];
        // Si ya teníamos un cantón (al cargar el usuario), cargamos sus parroquias
        if (this.usuario.cantonReside) {
          this.cargarParroquias(this.usuario.cantonReside);
        }
      },
      error: (error) => console.error('Error cantones:', error)
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
    this.catalogoService.getItems(`parroquias/canton/${cantonId}`).subscribe({
      next: (data) => this.datosrecuperados.parroquias = data || [],
      error: (error) => console.error('Error parroquias:', error)
    });
  }

  private detectarProvinciaDesdeCanton() {
    // Intentamos cargar la provincia basada en el primer dígito o consulta si el backend lo permite
    // Por ahora, si tenemos el cantón, buscaremos cargarlo. 
    // Opción simplificada: El backend debería retornar la provinciaId en el perfil.
    // Si no, podríamos necesitar un endpoint para obtener provincia por cantón.
    // Asumiremos que el usuario tiene 'cantonReside' y que eso permite cargar parroquias.
    this.cargarParroquias(this.usuario.cantonReside);
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
