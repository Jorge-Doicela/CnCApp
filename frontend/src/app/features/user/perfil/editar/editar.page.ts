import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom, Subscription } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from 'src/app/features/auth/services/auth.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class EditarPage implements OnInit, OnDestroy {
  perfilForm!: FormGroup;
  private subscripciones = new Subscription();
  usuario: any = null;
  cargando: boolean = true;
  guardando: boolean = false;
  modoAdmin: boolean = false; // true si el admin edita a otro usuario

  // Arrays para los selectores de ubicación
  provincias: any[] = [];
  cantones: any[] = [];
  cantonesOriginales: any[] = [];

  private authService = inject(AuthService);

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private route: ActivatedRoute,
    private navController: NavController,
    private http: HttpClient,
    private usuarioService: UsuarioService
  ) {
    // Intentar obtener datos pasados via navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      this.usuario = state.usuario || null;
    }
  }

  ngOnInit() {
    this.inicializarFormulario();

    // Si llegamos sin datos de navegación, intentar desde history.state
    if (!this.usuario && history.state?.usuario) {
      this.usuario = history.state.usuario;
    }

    this.cargarDatos();
  }

  inicializarFormulario() {
    this.perfilForm = this.formBuilder.group({
      primerNombre: ['', [Validators.required, Validators.minLength(2)]],
      segundoNombre: [''],
      primerApellido: ['', [Validators.required, Validators.minLength(2)]],
      segundoApellido: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      celular: [''],
      provincia: [null],
      canton: [null],
    });

    // Filtrar cantones cuando cambia provincia
    const sub = this.perfilForm.get('provincia')?.valueChanges.subscribe(provinciaId => {
      this.perfilForm.patchValue({ canton: null }, { emitEvent: false });
      this.cantones = provinciaId
        ? this.cantonesOriginales.filter(c => c.provinciaId === +provinciaId)
        : [];
    });
    if (sub) {
      this.subscripciones.add(sub);
    }
  }

  async cargarDatos() {
    try {
      // Cargar provincias y cantones
      const [provResp, cantResp] = await Promise.all([
        firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/provincias`)),
        firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/cantones`))
      ]);
      this.provincias = provResp || [];
      this.cantonesOriginales = cantResp || [];

      // Si hay ID en la URL → modo admin editando a un usuario específico
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.modoAdmin = true;
        this.usuario = await firstValueFrom(this.usuarioService.getUsuario(+idParam));
      }

      // Si aún no tenemos usuario → cargar el perfil propio
      if (!this.usuario) {
        const me = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/users/me`));
        this.usuario = me;
      }

      if (this.usuario) {
        // Pre-cargar cantones según la provincia del usuario
        if (this.usuario.provinciaId) {
          this.cantones = this.cantonesOriginales.filter(c => c.provinciaId === this.usuario.provinciaId);
        }

        this.perfilForm.patchValue({
          primerNombre: this.usuario.primerNombre || '',
          segundoNombre: this.usuario.segundoNombre || '',
          primerApellido: this.usuario.primerApellido || '',
          segundoApellido: this.usuario.segundoApellido || '',
          email: this.usuario.email || '',
          telefono: this.usuario.telefono || '',
          celular: this.usuario.celular || '',
          provincia: this.usuario.provinciaId || null,
          canton: this.usuario.cantonId || null,
        });
      }
    } catch (error: any) {
      console.error('[EDITAR] Error cargando datos:', error);
      this.presentToast('Error al cargar datos: ' + (error.error?.message || error.message), 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async guardarCambios() {
    if (this.perfilForm.invalid) {
      Object.keys(this.perfilForm.controls).forEach(key => {
        this.perfilForm.get(key)?.markAsTouched();
      });
      this.presentToast('Complete todos los campos obligatorios', 'warning');
      return;
    }

    this.guardando = true;
    const loading = await this.loadingController.create({ message: 'Guardando...', spinner: 'crescent' });
    await loading.present();

    try {
      const formData = this.perfilForm.value;
      const updateData: any = {
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre || null,
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido || null,
        email: formData.email,
        telefono: formData.telefono || null,
        celular: formData.celular || null,
        provinciaId: formData.provincia ? +formData.provincia : null,
        cantonId: formData.canton ? +formData.canton : null,
      };

      if (this.modoAdmin && this.usuario?.id) {
        // Admin editando a otro usuario → PUT /api/users/:id
        await firstValueFrom(this.usuarioService.updateUsuario(this.usuario.id, updateData));
      } else {
        // Usuario editando su propio perfil → PUT /api/users/me
        await firstValueFrom(this.http.put(`${environment.apiUrl}/users/me`, updateData));
      }

      this.presentToast('Perfil actualizado correctamente', 'success');
      this.volver();
    } catch (error: any) {
      console.error('[EDITAR] Error al guardar:', error);
      const msg = error.error?.message || error.message || 'Error desconocido';
      this.presentToast('Error al guardar: ' + msg, 'danger');
    } finally {
      loading.dismiss();
      this.guardando = false;
    }
  }

  volver() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.navController.navigateBack(['/gestionar-usuarios/detalles', idParam]);
    } else {
      this.navController.navigateBack('/ver-perfil');
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message, duration: 3000, position: 'bottom', color,
      buttons: [{ side: 'end', icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  ngOnDestroy() {
    this.subscripciones.unsubscribe();
  }
}
