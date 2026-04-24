import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
import { TipoParticipanteEnum, NivelGobiernoEnum } from 'src/app/shared/constants/enums';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarPage implements OnInit {
  segmentoActual: string = 'personal';
  today: Date = new Date();
  TipoParticipanteEnum = TipoParticipanteEnum;
  NivelGobiernoEnum = NivelGobiernoEnum;

  // Mapas para evitar IDs quemados
  resolvedIds = {
    tipoAutoridad: TipoParticipanteEnum.AUTORIDAD,
    tipoCiudadano: TipoParticipanteEnum.CIUDADANO,
    tipoFuncionario: TipoParticipanteEnum.FUNCIONARIO_GAD,
    tipoInstitucion: TipoParticipanteEnum.INSTITUCION,
    nivelProvincial: NivelGobiernoEnum.PROVINCIAL,
    nivelMunicipal: NivelGobiernoEnum.MUNICIPAL,
    nivelParroquial: NivelGobiernoEnum.PARROQUIAL,
    nivelMancomunidad: NivelGobiernoEnum.MANCOMUNIDADES,
    nivelRegimenEspecial: NivelGobiernoEnum.REGIMEN_ESPECIAL
  };

  usuario = {
    id: '',
    email: '',
    password: '', // Usually not changed here but kept for structure
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    nombre: '',
    ci: '',
    rolId: undefined as number | undefined,
    entidadId: undefined as number | undefined,
    estado: 1,
    firmaUrl: '',
    celular: '',
    genero: '',
    etnia: '',
    nacionalidad: '',
    tipoParticipante: 0,
    fechaNacimiento: '',
    cantonId: undefined as number | null | undefined,
    gadParroquiaId: undefined as number | null | undefined,
    generoId: undefined as number | null | undefined,
    etniaId: undefined as number | null | undefined,
    nacionalidadId: undefined as number | null | undefined,
    telefono: '',
    fotoPerfilUrl: '',
    // Auxiliar para UI
    Firma_Usuario_Imagen: null as any
  };

  // Objetos para tipos específicos
  autoridad = { cargo: '', nivelGobierno: '', gadAutoridad: '' };
  funcionarioGad = { cargo: '', competencias: [] as any[], nivelGobierno: '', gadFuncionarioGad: '' };
  institucion = { institucion: '', institucionNivelGobiernoId: undefined as number | undefined, gradoOcupacional: '', cargo: '' };

  opcionesInstitucionCombinadas: { value: string; label: string }[] = [];

  datosrecuperados = {
    roles: [] as any[],
    cargos: [] as any[],
    instituciones: [] as any[],
    educacionBasica: [] as any[],
    provincias: [] as any[],
    cantones: [] as any[],
    // Catálogo oficial plano GAD (gad_parroquias) - puede contener nombres duplicados
    gadParroquias: [] as any[],
    parroquias: [] as any[],
    generos: [] as any[],
    etnias: [] as any[],
    nacionalidades: [] as any[],
    tiposParticipante: [] as any[],
    entidades: [] as any[], // Nivel de gobierno
    mancomunidades: [] as any[],
    regimenesEspeciales: [] as any[],
    competencias: [] as any[],
    gradosOcupacionales: [] as any[],
  };

  datosbusqueda = {
    selectedProvincia: 0
  };

  cargando: boolean = false;

  getFullName = (u: any) => this.usuarioService.getFullName(u);

  /**
   * Obtiene la URL completa para una imagen de perfil o firma.
   * Maneja base64, URLs absolutas y rutas relativas del backend.
   */
  getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('assets/')) return path;


    // Si la ruta empieza con /, quitarlo para evitar dobles //
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // El backend sirve archivos desde public/, por lo que la URL base es el origen del API (sin /api)
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/${cleanPath}`;
  }


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

    try {
      await this.mostrarCargando('Cargando información...');

      const userId = +this.activatedRoute.snapshot.params['id'];
      if (isNaN(userId)) {
        this.presentToast('ID de usuario inválido', 'danger');
        this.router.navigate(['/gestionar-usuarios']);
        return;
      }

      this.usuario.id = userId.toString();

      // Load all catalogs in parallel first
      await Promise.all([
        this.obtenerRoles(),
        this.obtenerProvincias(),
        this.obtenerCargos(),
        this.obtenerInstituciones(),
        this.obtenerGeneros(),
        this.obtenerEtnias(),
        this.obtenerNacionalidades(),
        this.obtenerTiposParticipante(),
        this.obtenerEntidades(),
        this.obtenerRegimenesEspeciales(),
        this.obtenerMancomunidades(),
        this.obtenerCompetencias(),
        this.obtenerGradosOcupacionales(),
        this.obtenerGadParroquias(),
        this.obtenerEducacionBasica()
      ]);

      // Then resolve IDs dynamically based on names to avoid issues if IDs change in DB
      this.resolveStaticIds();

      // Then load user data
      await this.cargarUsuario(userId);

    } catch (error) {
      console.error('[ADMIN_EDITAR_DEBUG] Error en inicialización:', error);
      this.presentToast('Error al cargar la página', 'danger');
    } finally {
      await this.ocultarCargando();
      this.cdr.markForCheck();
    }
  }

  private cdr = inject(ChangeDetectorRef);

  async cargarUsuario(id: number) {
    console.log('[ADMIN_EDITAR_DEBUG] cargarUsuario called with ID:', id);
    try {
      const data: any = await firstValueFrom(
        this.usuarioService.getUsuario(id).pipe(timeout(10000))
      );
      if (!data) {
        this.presentToast('No se encontró el usuario', 'warning');
        return;
      }

      // Mapeo detallado similar a CrearPage
      this.usuario = {
        ...this.usuario,
        id: data.id.toString(),
        email: data.email || '',
        primerNombre: (data.primerNombre || '').replace(/\bnull\b/g, '').trim(),
        segundoNombre: (data.segundoNombre || '').replace(/\bnull\b/g, '').trim(),
        primerApellido: (data.primerApellido || '').replace(/\bnull\b/g, '').trim(),
        segundoApellido: (data.segundoApellido || '').replace(/\bnull\b/g, '').trim(),
        nombre: (data.nombre || '').replace(/\s*null\s*/g, ' ').trim(),
        ci: data.ci || '',
        rolId: data.rolId,
        entidadId: data.entidadId,
        estado: (data as any).estado ?? 1,
        firmaUrl: data.firmaUrl || '',
        celular: data.celular || '',
        genero: data.genero || '',
        etnia: data.etnia || '',
        nacionalidad: data.nacionalidad || '',
        tipoParticipante: Number(data.tipoParticipanteId || (data as any).tipoParticipante) || TipoParticipanteEnum.CIUDADANO,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento).toISOString().split('T')[0] : '',
        cantonId: data.cantonId,
        gadParroquiaId: data.gadParroquiaId,
        generoId: data.generoId,
        etniaId: data.etniaId,
        nacionalidadId: data.nacionalidadId,
      };

      // Cargar ubicación si existe
      if (this.usuario.cantonId) {
        await this.detectarProvinciaDesdeCanton();
      }

      // Cargar datos específicos si existen
      if (data.autoridad) {
        this.autoridad = {
          cargo: data.autoridad.cargo || '',
          nivelGobierno: data.autoridad.nivelGobierno || '',
          gadAutoridad: data.autoridad.gadAutoridad || ''
        };
      }
      if (data.funcionarioGad) {
        this.funcionarioGad = {
          cargo: data.funcionarioGad.cargo || '',
          competencias: Array.isArray(data.funcionarioGad.competencias) ? data.funcionarioGad.competencias : [],
          nivelGobierno: data.funcionarioGad.nivelGobierno || data.funcionarioGad.nivelGobiernoId || '',
          gadFuncionarioGad: data.funcionarioGad.gadFuncionarioGad || ''
        };
      }
      if (data.institucion) {
        const rawInst = data.institucion.institucion ?? data.institucion.institucionId;
        const instStr =
          rawInst == null || rawInst === ''
            ? ''
            : typeof rawInst === 'string' && (rawInst.startsWith('e:') || rawInst.startsWith('i:'))
              ? rawInst
              : `i:${Number(rawInst)}`;
        this.institucion = {
          institucion: instStr,
          institucionNivelGobiernoId: data.institucion.institucionNivelGobiernoId || data.entidadId || undefined,
          gradoOcupacional: data.institucion.gradoOcupacionalId?.toString() || data.institucion.gradoOcupacional || '',
          cargo: data.institucion.cargo || ''
        };
      }

      console.log('[ADMIN_EDITAR_DEBUG] Usuario loaded successfully');
    } catch (error) {
      console.error('[ADMIN_EDITAR_DEBUG] Error al cargar usuario:', error);
      throw error; // Let ngOnInit handle it
    }
  }

  async obtenerRoles() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('rol'));
      this.datosrecuperados.roles = data || [];
    } catch (error) {
      console.error('Error al obtener roles:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerTiposParticipante() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('tipos-participante'));
      this.datosrecuperados.tiposParticipante = data || [];
    } catch (error) {
      console.error('Error al obtener tipos de participante:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerProvincias() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('provincias'));
      this.datosrecuperados.provincias = data || [];
    } catch (error) {
      console.error('Error provincias:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  cambioProvincia() {
    this.usuario.cantonId = undefined;
    this.datosrecuperados.cantones = [];
    this.datosrecuperados.parroquias = [];

    if (this.datosbusqueda.selectedProvincia) {
      this.cargarCantones(this.datosbusqueda.selectedProvincia);
    }
  }

  async cargarCantones(provinciaId: number) {
    if (!provinciaId) return;
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('cantones'));
      this.datosrecuperados.cantones = data.filter((c: any) => c.provinciaId == provinciaId);
      // Si ya teníamos un cantón (al cargar el usuario), cargamos sus parroquias
      if (this.usuario.cantonId) {
        await this.cargarParroquias(this.usuario.cantonId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Método por compatibilidad: la selección actual usa `gadParroquiaId`
  // y no depende del cantón, así que no hace nada.
  async cargarParroquias(_cantonId: number | string) {
    return;
  }

  cambioCanton() {
    this.datosrecuperados.parroquias = [];
  }

  async obtenerGadParroquias() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/gad-parroquias'));
      this.datosrecuperados.gadParroquias = data || [];
    } catch (err) {
      console.error('Error parroquias GAD:', err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  private async detectarProvinciaDesdeCanton() {
    // Logic to auto-select province if user has canton logic required fetching all cantones and finding the one.
    // For now, we load all cantones and finding the one matching user.cantonReside
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('cantones'));
      const canton = data.find((c: any) => c.id == this.usuario.cantonId);
      if (canton) {
        this.datosbusqueda.selectedProvincia = canton.provinciaId;
        await this.cargarCantones(canton.provinciaId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerCargos() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('cargos'));
      this.datosrecuperados.cargos = data || [];
    } catch (error) {
      console.error('Error cargos:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }


  async obtenerInstituciones() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/instituciones'));
      this.datosrecuperados.instituciones = data || [];
    } catch (error) {
      console.error('Error instituciones:', error);
    } finally {
      this.rebuildOpcionesInstitucion();
    }
  }

  async obtenerEducacionBasica() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/educacion-basica'));
      this.datosrecuperados.educacionBasica = data || [];
    } catch (error) {
      console.error('Error educación básica:', error);
    } finally {
      this.rebuildOpcionesInstitucion();
    }
  }

  updateInstitucionTipo(tipoId: number) {
    this.institucion.institucionNivelGobiernoId = tipoId;
    this.institucion.institucion = '';
    this.rebuildOpcionesInstitucion();
    this.cdr.markForCheck();
  }

  rebuildOpcionesInstitucion() {
    const selectedTipoId = this.institucion.institucionNivelGobiernoId;
    if (!selectedTipoId) {
      this.opcionesInstitucionCombinadas = [];
      return;
    }

    const tipoSelected = this.datosrecuperados.entidades.find(e => e.id === selectedTipoId);
    const esEducacion = tipoSelected?.nombre?.toUpperCase().includes('EDUCACIÓN');
    const esMancomunidad = tipoSelected?.nombre?.toUpperCase().includes('MANCOMUNIDADES');
    const esRegimenEspecial = tipoSelected?.nombre?.toUpperCase().includes('RÉGIMEN ESPECIAL');

    if (esEducacion) {
      this.opcionesInstitucionCombinadas = (this.datosrecuperados.educacionBasica || []).map((e: any) => ({ value: `e:${e.id}`, label: e.nombre }));
    } else if (esMancomunidad) {
      this.opcionesInstitucionCombinadas = (this.datosrecuperados.mancomunidades || []).map((m: any) => ({ value: `m:${m.id}`, label: m.nombre }));
    } else if (esRegimenEspecial) {
      this.opcionesInstitucionCombinadas = (this.datosrecuperados.regimenesEspeciales || []).map((r: any) => ({ value: `r:${r.id}`, label: r.nombre }));
    } else {
      this.opcionesInstitucionCombinadas = (this.datosrecuperados.instituciones || [])
        .filter((i: any) => i.tipoInstitucionId === selectedTipoId)
        .map((i: any) => ({ value: `i:${i.id}`, label: i.nombre }));
    }

    this.opcionesInstitucionCombinadas.sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }

  getOpcionesMunicipioCombinadas() {
    return (this.datosrecuperados.instituciones || [])
      .filter((i: any) => i.tipoInstitucionId === this.resolvedIds.nivelMunicipal)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  async obtenerEntidades() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/tipos-institucion'));
      this.datosrecuperados.entidades = data || [];
    } catch (error) {
      console.error('Error entidades:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerMancomunidades() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/mancomunidades'));
      this.datosrecuperados.mancomunidades = data || [];
    } catch (error) {
      console.error('Error mancomunidades:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerCompetencias() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/competencias'));
      this.datosrecuperados.competencias = data || [];
    } catch (error) {
      console.error('Error competencias:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerGradosOcupacionales() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/grados-ocupacionales'));
      this.datosrecuperados.gradosOcupacionales = data || [];
    } catch (error) {
      console.error('Error grados:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerGeneros() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('generos'));
      this.datosrecuperados.generos = data || [];
    } catch (error) {
      console.error('Error generos:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerEtnias() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('etnias'));
      this.datosrecuperados.etnias = data || [];
    } catch (error) {
      console.error('Error etnias:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  async obtenerNacionalidades() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('nacionalidades'));
      this.datosrecuperados.nacionalidades = data || [];
    } catch (error) {
      console.error('Error nacionalidades:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }


  seleccionarFirma(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamaño del archivo (máximo 5MB para coincidir con el servidor)
    if (file.size > 5 * 1024 * 1024) {
      this.presentToast('El tamaño del archivo no debe exceder los 5MB', 'warning');
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

    const datosAEnviar: any = {
      primerNombre: this.usuario.primerNombre,
      segundoNombre: this.usuario.segundoNombre || null,
      primerApellido: this.usuario.primerApellido,
      segundoApellido: this.usuario.segundoApellido || null,
      email: this.usuario.email || null,
      telefono: this.usuario.telefono || null,
      celular: this.usuario.celular || null,
      generoId: this.usuario.generoId ? Number(this.usuario.generoId) : null,
      etniaId: this.usuario.etniaId ? Number(this.usuario.etniaId) : null,
      nacionalidadId: this.usuario.nacionalidadId ? Number(this.usuario.nacionalidadId) : null,
      fechaNacimiento: this.usuario.fechaNacimiento || null,
      provinciaId: this.datosbusqueda.selectedProvincia ? Number(this.datosbusqueda.selectedProvincia) : null,
      cantonId: this.usuario.cantonId ? Number(this.usuario.cantonId) : null,
      parroquiaId: null,
      gadParroquiaId: this.usuario.gadParroquiaId ? Number(this.usuario.gadParroquiaId) : null,
      rolId: this.usuario.rolId ? Number(this.usuario.rolId) : undefined,
      entidadId: this.usuario.entidadId ? Number(this.usuario.entidadId) : null,
      tipoParticipanteId: this.usuario.tipoParticipante ? Number(this.usuario.tipoParticipante) : TipoParticipanteEnum.CIUDADANO,
      estado: this.usuario.estado !== undefined ? Number(this.usuario.estado) : 1,
      autoridad: this.usuario.tipoParticipante == TipoParticipanteEnum.AUTORIDAD ? this.autoridad : null,
      funcionarioGad: this.usuario.tipoParticipante == TipoParticipanteEnum.FUNCIONARIO_GAD ? this.funcionarioGad : null,
      institucion: this.usuario.tipoParticipante == TipoParticipanteEnum.INSTITUCION ? (() => {
        const raw = this.institucion.institucion;
        const institucionVal =
          raw == null || raw === ''
            ? undefined
            : typeof raw === 'string' && (raw.startsWith('e:') || raw.startsWith('i:'))
              ? raw
              : `i:${Number(raw)}`;
        return { ...this.institucion, institucion: institucionVal };
      })() : null
    };

    if (this.usuario.password && this.usuario.password.trim() !== '') {
      datosAEnviar.password = this.usuario.password;
    }

    if (this.usuario.fotoPerfilUrl) datosAEnviar.fotoPerfilUrl = this.usuario.fotoPerfilUrl;
    if (this.usuario.firmaUrl) datosAEnviar.firmaUrl = this.usuario.firmaUrl;

    try {
      await firstValueFrom(this.usuarioService.updateUsuario(Number(this.usuario.id), datosAEnviar as any));
      this.ocultarCargando();
      await this.mostrarAlertaExito('Usuario actualizado correctamente');
      this.router.navigate(['/gestionar-usuarios']);
      this.cdr.markForCheck();
    } catch (error: any) {
      this.ocultarCargando();
      console.error('Error al actualizar usuario:', error);
      this.presentToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
      this.cdr.markForCheck();
    }
  }

  validarFormulario(): boolean {
    if (!this.usuario.primerNombre?.trim() || !this.usuario.primerApellido?.trim()) {
      this.presentToast('El nombre y primer apellido son obligatorios', 'warning');
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

  async obtenerRegimenesEspeciales() {
    try {
      const data = await firstValueFrom(this.catalogoService.getItems('public/regimenes-especiales'));
      this.datosrecuperados.regimenesEspeciales = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // Navigation between segments
  proximoPasso() {
    if (this.segmentoActual === 'personal') {
      this.segmentoActual = 'ubicacion';
    } else if (this.segmentoActual === 'ubicacion') {
      this.segmentoActual = 'sistema';
    }
    this.scrollToTop();
  }

  passoAnterior() {
    if (this.segmentoActual === 'sistema') {
      this.segmentoActual = 'ubicacion';
    } else if (this.segmentoActual === 'ubicacion') {
      this.segmentoActual = 'personal';
    }
    this.scrollToTop();
  }

  resolveStaticIds() {
    const findIdByCodigo = (list: any[], codigo: string) => {
      const match = list.find(i => i.codigo === codigo);
      return match ? match.id : undefined;
    };

    const findIdByNombre = (list: any[], nombre: string) => {
      const match = list.find(i => i.nombre === nombre);
      return match ? match.id : undefined;
    };

    // Resolver Tipos de Participante
    this.resolvedIds.tipoAutoridad = findIdByCodigo(this.datosrecuperados.tiposParticipante, 'AUTORIDAD') || TipoParticipanteEnum.AUTORIDAD;
    this.resolvedIds.tipoCiudadano = findIdByCodigo(this.datosrecuperados.tiposParticipante, 'CIUDADANO') || TipoParticipanteEnum.CIUDADANO;
    this.resolvedIds.tipoFuncionario = findIdByCodigo(this.datosrecuperados.tiposParticipante, 'FUNCIONARIO_GAD') || TipoParticipanteEnum.FUNCIONARIO_GAD;
    this.resolvedIds.tipoInstitucion = findIdByCodigo(this.datosrecuperados.tiposParticipante, 'INSTITUCION') || TipoParticipanteEnum.INSTITUCION;

    // Resolver Niveles de Gobierno (Entidades)
    this.resolvedIds.nivelProvincial = findIdByNombre(this.datosrecuperados.entidades, 'INSTITUCIÓN — NIVEL PROVINCIAL') || NivelGobiernoEnum.PROVINCIAL;
    this.resolvedIds.nivelMunicipal = findIdByNombre(this.datosrecuperados.entidades, 'INSTITUCIÓN — NIVEL MUNICIPAL (CANTONES)') || NivelGobiernoEnum.MUNICIPAL;
    this.resolvedIds.nivelParroquial = findIdByNombre(this.datosrecuperados.entidades, 'INSTITUCIÓN — NIVEL PARROQUIAL RURAL') || NivelGobiernoEnum.PARROQUIAL;
    this.resolvedIds.nivelMancomunidad = findIdByNombre(this.datosrecuperados.entidades, 'MANCOMUNIDADES Y CONSORCIOS') || NivelGobiernoEnum.MANCOMUNIDADES;
    this.resolvedIds.nivelRegimenEspecial = findIdByNombre(this.datosrecuperados.entidades, 'RÉGIMEN ESPECIAL') || NivelGobiernoEnum.REGIMEN_ESPECIAL;

    console.log('[ADMIN_EDITAR_DEBUG] IDs Dinámicos Resueltos (por código):', this.resolvedIds);
  }

  getGadsParaNivel(nivel: any) {
    const n = Number(nivel);

    if (n === this.resolvedIds.nivelMancomunidad) {
      return this.datosrecuperados.mancomunidades;
    } else if (n === this.resolvedIds.nivelRegimenEspecial) {
      return this.datosrecuperados.regimenesEspeciales;
    } else if (n === this.resolvedIds.nivelMunicipal) {
      return this.getOpcionesMunicipioCombinadas();
    } else if (n === this.resolvedIds.nivelParroquial) {
      return this.datosrecuperados.gadParroquias;
    } else {
      // PROVINCIAL or others
      return this.datosrecuperados.provincias;
    }
  }

  private scrollToTop() {
    const content = document.querySelector('ion-content');
    if (content) {
      (content as any).scrollToTop(500);
    }
  }

  triggerSignatureUpload(event: Event) {
    const input = (event.currentTarget as HTMLElement).querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }
}
