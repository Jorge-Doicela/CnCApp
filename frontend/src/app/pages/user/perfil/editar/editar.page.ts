// editar.page.ts - Fixed version with correct navigation state handling
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { supabase } from 'src/supabase';
import { AlertController, LoadingController, ToastController, ActionSheetController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: false
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
    private navController: NavController
  ) {
    // Obtener datos del estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      const state = navigation.extras.state as any;
      this.usuario = state.usuario;
      this.modoFirma = state.modoFirma || false;
      console.log('Usuario recibido en constructor:', this.usuario);
    } else {
      console.log('No se recibieron datos de usuario en el constructor');
    }
  }

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarUbicaciones();

    // Si no se recibieron los datos en el constructor, intentar obtenerlos de history.state
    if (!this.usuario && history.state && history.state.usuario) {
      this.usuario = history.state.usuario;
      this.modoFirma = history.state.modoFirma || false;
      console.log('Usuario recuperado de history.state:', this.usuario);
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
      // Cargar provincias
      const { data: provinciasData, error: provinciasError } = await supabase
        .from('Provincias')
        .select('*')
        .eq('Estado', true)
        .order('Nombre_Provincia', { ascending: true });

      if (provinciasError) throw provinciasError;
      this.provincias = provinciasData || [];

      // Cargar todos los cantones (se filtrarán después)
      const { data: cantonesData, error: cantonesError } = await supabase
        .from('Cantones')
        .select('*')
        .eq('estado', true)
        .order('nombre_canton', { ascending: true });

      if (cantonesError) throw cantonesError;
      this.cantonesOriginales = cantonesData || [];

      // Cargar todas las parroquias (se filtrarán después)
      const { data: parroquiasData, error: parroquiasError } = await supabase
        .from('parroquia')
        .select('*')
        .eq('estado', true)
        .order('nombre_parroquia', { ascending: true });

      if (parroquiasError) throw parroquiasError;
      this.parroquiasOriginales = parroquiasData || [];

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
      if (!this.usuario) {
        console.log('No hay datos de usuario, intentando cargar datos desde auth...');
        // Obtener usuario autenticado actual
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
          throw new Error('Error al obtener usuario autenticado: ' + (authError?.message || 'Usuario no encontrado'));
        }

        const authUid = authData.user.id;

        // Obtener datos del usuario desde la tabla Usuario
        const { data: usuarioData, error: userError } = await supabase
          .from('Usuario')
          .select('*')
          .eq('auth_uid', authUid)
          .single();

        if (userError || !usuarioData) {
          throw new Error('Error al obtener datos del usuario: ' + (userError?.message || 'Usuario no encontrado'));
        }

        this.usuario = {
          ...usuarioData,
          email: authData.user.email,
          nombreCompleto: `${usuarioData.Nombre_Usuario || ''} ${usuarioData.apellido || ''}`
        };

        console.log('Usuario cargado desde la base de datos:', this.usuario);
      }

      if (this.usuario) {
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
      } else {
        throw new Error('No se encontró información del usuario para editar');
      }
    } catch (error: any) {
      console.error('Error al cargar datos de usuario:', error);
      this.presentToast('Error al cargar datos del usuario: ' + error.message, 'danger');
      setTimeout(() => {
        this.volver();
      }, 3000);
    } finally {
      this.cargando = false;

      // Si estamos en modo firma, redirigir a la página de firma
      if (this.modoFirma && this.usuario) {
        this.navController.navigateForward('/firma', {
          state: {
            usuario: this.usuario
          }
        });
      }
    }
  }

  async inicializarDatosUbicacion() {
    try {
      // Si el usuario tiene parroquia asignada, necesitamos buscar su cantón y provincia
      if (this.usuario.Parroquia_Reside_Usuario) {
        this.parroquiaSeleccionadaId = this.usuario.Parroquia_Reside_Usuario;

        // Buscar la parroquia para obtener el cantón
        const parroquia = this.parroquiasOriginales.find(p =>
          p.codigo_parroquia === this.parroquiaSeleccionadaId
        );

        if (parroquia) {
          this.cantonSeleccionadoId = parroquia.codigo_canton;
          this.filtrarParroquiasPorCanton(this.cantonSeleccionadoId);

          // Buscar el cantón para obtener la provincia
          const canton = this.cantonesOriginales.find(c =>
            c.codigo_canton === this.cantonSeleccionadoId
          );

          if (canton) {
            this.provinciaSeleccionadaId = canton.codigo_provincia;
            this.filtrarCantonesPorProvincia(this.provinciaSeleccionadaId);
          }
        }
      }
      // Si el usuario solo tiene cantón, buscar su provincia
      else if (this.usuario.Canton_Reside_Usuario) {
        this.cantonSeleccionadoId = this.usuario.Canton_Reside_Usuario;

        // Buscar el cantón para obtener la provincia
        const canton = this.cantonesOriginales.find(c =>
          c.codigo_canton === this.cantonSeleccionadoId
        );

        if (canton) {
          this.provinciaSeleccionadaId = canton.codigo_provincia;
          this.filtrarCantonesPorProvincia(this.provinciaSeleccionadaId);
          this.filtrarParroquiasPorCanton(this.cantonSeleccionadoId);
        }
      }
    } catch (error) {
      console.error('Error al inicializar datos de ubicación:', error);
    }
  }

  async actualizarFotoPerfil() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar fuente de imagen',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera',
          handler: () => {
            this.capturarFoto(CameraSource.Camera);
          }
        },
        {
          text: 'Galería',
          icon: 'image',
          handler: () => {
            this.capturarFoto(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async capturarFoto(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 500,
        height: 500,
        correctOrientation: true
      });

      if (image.dataUrl) {
        const loading = await this.loadingController.create({
          message: 'Subiendo imagen...',
          spinner: 'crescent'
        });
        await loading.present();

        try {
          // Convertir dataUrl a Blob
          const response = await fetch(image.dataUrl);
          const blob = await response.blob();

          // Generar nombre de archivo único
          const userId = this.usuario.Id_Usuario;
          const extension = this.getFileExtensionFromMimeType(image.format || 'jpeg');
          const filename = `${uuidv4()}.${extension}`;
          const filePath = `foto-perfil/${userId}/${filename}`;

          // Subir a Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('imagenes')
            .upload(filePath, blob);

          if (uploadError) {
            throw new Error(uploadError.message);
          }

          // Obtener URL pública
          const { data: urlData } = await supabase.storage
            .from('imagenes')
            .getPublicUrl(filePath);

          const imageUrl = urlData.publicUrl;

          // Actualizar perfil en la base de datos
          const { error: updateError } = await supabase
            .from('Usuario')
            .update({ Imagen_Perfil: imageUrl })
            .eq('Id_Usuario', this.usuario.Id_Usuario);

          if (updateError) {
            throw new Error(updateError.message);
          }

          // Actualizar los datos locales
          this.usuario.Imagen_Perfil = imageUrl;
          this.presentToast('Foto de perfil actualizada correctamente', 'success');
        } catch (error: any) {
          this.presentToast('Error al subir la imagen: ' + error.message, 'danger');
        } finally {
          loading.dismiss();
        }
      }
    } catch (error: any) {
      this.presentToast('Error al capturar la imagen: ' + error.message, 'danger');
    }
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

      // Preparar objeto de actualización
      const updateData: any = {};

      // Verificar qué campos existen en la tabla Usuario y usar los nombres correctos
      if (formData.nombre) {
        updateData.Nombre_Usuario = formData.nombre;
        updateData.nombre = formData.nombre; // Mantener compatibilidad con ambos campos
      }

      if (formData.apellido) {
        updateData.apellido = formData.apellido;
      }

      if (formData.telefono) {
        updateData.Celular_Usuario = formData.telefono;
        updateData.telefono = formData.telefono; // Mantener compatibilidad con ambos campos
      }

      if (formData.genero) {
        updateData.Genero_Usuario = formData.genero;
      }

      if (formData.nacionalidad) {
        updateData.Nacionalidad_Usuario = formData.nacionalidad;
      }

      // Guardar los códigos seleccionados, no los nombres mostrados
      if (this.cantonSeleccionadoId) {
        updateData.Canton_Reside_Usuario = this.cantonSeleccionadoId;
      }

      if (this.parroquiaSeleccionadaId) {
        updateData.Parroquia_Reside_Usuario = this.parroquiaSeleccionadaId;
      }

      if (formData.direccion) {
        updateData.direccion = formData.direccion;
      }

      // Actualizar datos en la base de datos
      const { error } = await supabase
        .from('Usuario')
        .update(updateData)
        .eq('Id_Usuario', this.usuario.Id_Usuario);

      if (error) {
        throw new Error(error.message);
      }

      this.presentToast('Perfil actualizado correctamente', 'success');
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
    this.navController.navigateBack('/ver-perfil');
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
