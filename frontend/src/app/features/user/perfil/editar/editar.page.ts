import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// editar.page.ts - Fixed version with correct navigation state handling
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController, ActionSheetController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class EditarPage implements OnInit {
  perfilForm!: FormGroup;
  usuario: any = null;
  cargando: boolean = true;
  guardando: boolean = false;
  modoFirma: boolean = false;

  // Arrays para los selectores de ubicación
  provincias: any[] = [];
  cantones: any[] = [];
  parroquias: any[] = [];
  cantonesOriginales: any[] = [];
  parroquiasOriginales: any[] = [];

  // Códigos seleccionados para actualización
  provinciaSeleccionadaId: string = '';
  cantonSeleccionadoId: string = '';
  parroquiaSeleccionadaId: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private route: ActivatedRoute,
    private navController: NavController,
    private http: HttpClient,
    private usuarioService: UsuarioService
  ) {
    // Obtener datos del estado de navegación
    console.log('[EDITAR_DEBUG] Constructor iniciado');
    const navigation = this.router.getCurrentNavigation();
    console.log('[EDITAR_DEBUG] Navigation object:', navigation);
    if (navigation && navigation.extras && navigation.extras.state) {
      const state = navigation.extras.state as any;
      this.usuario = state.usuario;
      this.modoFirma = state.modoFirma || false;
      console.log('[EDITAR_DEBUG] Usuario recibido en constructor:', this.usuario);
      console.log('[EDITAR_DEBUG] modoFirma en constructor:', this.modoFirma);
    } else {
      console.log('[EDITAR_DEBUG] No se recibieron datos de usuario en el constructor');
    }
  }

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarUbicaciones();

    // Si no se recibieron los datos en el constructor, intentar vaciarlo
    if (!this.usuario && history.state && history.state.usuario) {
      this.usuario = history.state.usuario;
      this.modoFirma = history.state.modoFirma || false;
      console.log('Usuario recuperado de history.state:', this.usuario);
    }

    // Si aun no tenemos usuario, revisar los params de la ruta (caso Admin)
    if (!this.usuario) {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        console.log('[EDITAR_DEBUG] ID encontrado en URL:', idParam);
        // Flag para indicar que estamos en modo edición por ID (Admin suele usar esto)
        // La carga real sucederá en cargarDatosUsuario
      }
    }
  }

  inicializarFormulario() {
    this.perfilForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      cedula: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      genero: [''],
      nacionalidad: [''],
      provincia: [''],
      canton: [''],
      parroquia: [''],
      direccion: ['']
    });

    // Escuchar cambios en los campos de ubicación
    this.perfilForm.get('provincia')?.valueChanges.subscribe(provinciaId => {
      if (provinciaId) {
        this.provinciaSeleccionadaId = provinciaId;
        this.filtrarCantonesPorProvincia(provinciaId);
        // Resetear cantón y parroquia cuando cambia la provincia
        this.perfilForm.patchValue({
          canton: '',
          parroquia: ''
        });
      }
    });

    this.perfilForm.get('canton')?.valueChanges.subscribe(cantonId => {
      if (cantonId) {
        this.cantonSeleccionadoId = cantonId;
        this.filtrarParroquiasPorCanton(cantonId);
        // Resetear parroquia cuando cambia el cantón
        this.perfilForm.patchValue({
          parroquia: ''
        });
      }
    });

    this.perfilForm.get('parroquia')?.valueChanges.subscribe(parroquiaId => {
      if (parroquiaId) {
        this.parroquiaSeleccionadaId = parroquiaId;
      }
    });
  }

  async cargarUbicaciones() {
    try {
      // TODO: Implementar endpoints reales o usar JSON local
      console.warn('Carga de ubicaciones pendiente de implementación backend');

      this.provincias = [];
      this.cantonesOriginales = [];
      this.parroquiasOriginales = [];

      // Después de cargar todas las ubicaciones, cargar los datos del usuario
      await this.cargarDatosUsuario();
    } catch (error: any) {
      this.presentToast('Error al cargar las ubicaciones: ' + error.message, 'danger');
      // Aún así, intentamos cargar los datos del usuario
      await this.cargarDatosUsuario();
    }
  }

  filtrarCantonesPorProvincia(provinciaId: string) {
    this.cantones = this.cantonesOriginales.filter(canton =>
      canton.codigo_provincia === provinciaId
    );
  }

  filtrarParroquiasPorCanton(cantonId: string) {
    this.parroquias = this.parroquiasOriginales.filter(parroquia =>
      parroquia.codigo_canton === cantonId
    );
  }

  async cargarDatosUsuario() {
    try {
      // Si no tenemos usuario, intentar obtenerlo del parámetro de ruta o navegación al perfil
      // Si no tenemos usuario, intentar obtenerlo del parámetro de ruta o navegación al perfil
      if (!this.usuario) {

        // 1. Intentar obtener ID de la URL (Caso Admin)
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
          console.log('[EDITAR_DEBUG] Cargando usuario por ID de URL:', idParam);
          try {
            this.usuario = await firstValueFrom(this.usuarioService.getUsuario(+idParam));
            console.log('[EDITAR_DEBUG] Usuario cargado por ID:', this.usuario);
          } catch (err) {
            console.error('[EDITAR_DEBUG] Error loading user by ID:', err);
            throw err; // Re-throw to be caught by outer catch
          }
        }

        // 2. Si falló lo anterior, intentar obtener auth_uid (Caso Perfil Propio)
        if (!this.usuario || Object.keys(this.usuario).length === 0) {
          const authUid = localStorage.getItem('auth_uid');
          if (authUid && !idParam) { // Solo si NO hay ID param, para no sobreescribir admin view
            // TODO: Fetch from backend
            console.warn('Fetch user from backend unimplemented in editar page');
            // Mock empty
            this.usuario = {};
          }
        }
      }

      if (this.usuario && Object.keys(this.usuario).length > 0) {
        // Si el usuario tiene asignados códigos, necesitamos obtener los valores iniciales para los selectores
        await this.inicializarDatosUbicacion();

        this.perfilForm.patchValue({
          nombre: this.usuario.Nombre_Usuario || this.usuario.nombre || '',
          apellido: this.usuario.apellido || '',
          cedula: this.usuario.CI_Usuario || this.usuario.cedula || '',
          email: this.usuario.email || '',
          telefono: this.usuario.Celular_Usuario || this.usuario.telefono || '',
          genero: this.usuario.Genero_Usuario || '',
          nacionalidad: this.usuario.Nacionalidad_Usuario || '',
          provincia: this.provinciaSeleccionadaId,
          canton: this.cantonSeleccionadoId,
          parroquia: this.parroquiaSeleccionadaId,
          direccion: this.usuario.direccion || ''
        });

        console.log('Formulario inicializado con datos de usuario');
      }
    } catch (error: any) {
      console.error('[EDITAR_DEBUG] Error al cargar datos de usuario:', error);
      // Mostrar alerta visible para el usuario para debug
      const alert = await this.alertController.create({
        header: 'Error de Depuración',
        subHeader: 'Ocurrió un error al cargar los datos',
        message: error.message || JSON.stringify(error),
        buttons: ['OK']
      });
      await alert.present();

      this.presentToast('Error al cargar datos del usuario: ' + error.message, 'danger');
      // COMENTADO PARA DEBUG: No redirigir automáticamente
      // setTimeout(() => {
      //   console.log('[EDITAR_DEBUG] Redirigiendo por error catch');
      //   this.volver();
      // }, 3000);
    } finally {
      this.cargando = false;
      console.log('[EDITAR_DEBUG] Finally block reached.');
      console.log('[EDITAR_DEBUG] ModoFirma:', this.modoFirma);
      console.log('[EDITAR_DEBUG] Usuario:', this.usuario);
      console.log('[EDITAR_DEBUG] Usuario keys:', this.usuario ? Object.keys(this.usuario) : 'null');

      // Si estamos en modo firma, redirigir a la página de firma
      if (this.modoFirma && this.usuario) {
        console.log('[EDITAR_DEBUG] REDIRECT TRIGGERED: Redirecting to Firma');
        this.navController.navigateForward('/firma', {
          state: {
            usuario: this.usuario
          }
        });
      } else {
        console.log('[EDITAR_DEBUG] NO REDIRECT: modoFirma=', this.modoFirma, ', usuario=', !!this.usuario);
      }
    }
  }

  async inicializarDatosUbicacion() {
    // TODO: Implementar lógica de ubicación con datos del backend
  }

  async actualizarFotoPerfil() {
    this.presentToast('Cambio de foto no disponible (Migrando a Backend)', 'warning');
  }

  async capturarFoto(source: CameraSource) {
    // TODO
  }

  getFileExtensionFromMimeType(format: string): string {
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        return 'jpg';
      case 'png':
        return 'png';
      default:
        return 'jpg';
    }
  }

  async guardarCambios() {
    if (this.perfilForm.invalid) {
      // Marcar todos los campos como touched para mostrar validaciones
      Object.keys(this.perfilForm.controls).forEach(key => {
        const control = this.perfilForm.get(key);
        control?.markAsTouched();
      });
      this.presentToast('Por favor complete todos los campos obligatorios.', 'warning');
      return;
    }

    this.guardando = true;
    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Obtener valores del formulario
      const formData = this.perfilForm.value;

      // TODO: Prepare backend DTO

      // Actualizar datos en la base de datos (Backend call)
      // await firstValueFrom(this.http.put(`${environment.apiUrl}/users/${this.usuario.Id_Usuario}`, updateData));
      console.warn('Update user unimplemented');

      this.presentToast('Simulación: Perfil actualizado correctamente', 'success');
      this.volver();
    } catch (error: any) {
      this.presentToast('Error al actualizar el perfil: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
      this.guardando = false;
    }
  }

  cancelar() {
    this.volver();
  }

  volver() {
    // Si estamos editando un usuario específico (URL tiene ID), volver a detalles o lista
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.navController.navigateBack(['/gestionar-usuarios/detalles', idParam]);
    } else {
      // Caso por defecto: volver al perfil propio
      this.navController.navigateBack('/ver-perfil');
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      buttons: [
        {
          side: 'end',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
