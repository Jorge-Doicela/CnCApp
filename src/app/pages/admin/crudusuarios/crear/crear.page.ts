import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: false,
})
export class CrearPage implements OnInit {
  // Variable para mensajes de validación
  mensajeValidacionCedula: string = '';

  usuarioGeneral = {
    // Datos para la validación de supabase
    email: '',
    password: '',
    // Datos generales para todos los usuarios
    Nombre1: '',
    Nombre2: '',
    Apellido1: '',
    Apellido2: '',
    Rol_Usuario: null, // Cambiado a null para requerir selección explícita
    Nombre: '',
    CI: '',
    Fecha_Registro: new Date(),
    Estado: 1, // 1 = Activo
    auth_uid: '',
    Entidad_Usuario: '',
    Firma_Usuario: '',
    celular: '',
    convencional: '',
    Genero: '',
    Etnia: '',
    Nacionalidad: '',
    tipoParticipante: 0, // Por defecto ciudadano
    fechaNacimiento: '',
    canton_reside: '',
    parroquia_reside: '',
  };

  autoridad = {
    cargo: '',
    nivelgobierno: '',
    gadAutoridad: '',
    idUsuario: '',
  };

  funcionarioGad = {
    cargo: '',
    competencias: '',
    nivelgobierno: '',
    gadFuncionarioGad: '',
    idUsuario: ''
  };

  institucion = {
    institucion: '',
    gradoOcupacional: '',
    cargo: '',
    idUsuario: ''
  };

  datosrecuperados = {
    roles: [] as any[],
    cargos: [] as any[],
    instituciones: [] as any[],
    provincias: [] as any[],
    cantones: [] as any[],
    parroquias: [] as any[],
    parroquiasSeleccionadas: [] as any[],
    macrocomunidades: [] as any[],
    municipios: [] as any[],
    competencias: [] as any[],
  }

  datosconcatenar = {
    provinciasConCantones: [] as any[],
  }

  datosbusqueda = {
    selectedProvincia: 0,
    selectedCanton: 0
  }

  // Estado de la página
  isLoading: boolean = false;
  formErrors: any = {};
  // Variable para controlar si los campos de nombre están bloqueados
  camposNombreReadonly: boolean = false;
  // Códigos de provincias para validación de cédula
  provinciasCodigos: { [key: string]: string } = {
    '01': 'Azuay',
    '02': 'Bolívar',
    '03': 'Cañar',
    '04': 'Carchi',
    '05': 'Cotopaxi',
    '06': 'Chimborazo',
    '07': 'El Oro',
    '08': 'Esmeraldas',
    '09': 'Guayas',
    '10': 'Imbabura',
    '11': 'Loja',
    '12': 'Los Ríos',
    '13': 'Manabí',
    '14': 'Morona Santiago',
    '15': 'Napo',
    '16': 'Pastaza',
    '17': 'Pichincha',
    '18': 'Tungurahua',
    '19': 'Zamora Chinchipe',
    '20': 'Galápagos',
    '21': 'Sucumbíos',
    '22': 'Orellana',
    '23': 'Santo Domingo de los Tsáchilas',
    '24': 'Santa Elena',
    '30': 'Ecuatorianos en el exterior'
  };

  cedulaValidada: boolean = false;
  nombresEdited: boolean = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Primero obtener roles para asegurar que estén disponibles
    this.obtenerRoles();
    this.obtenerProvincias();
    // Precargamos los datos que puedan ser necesarios según el tipo de usuario
    this.obtenerCargos();
    this.obtenerInstituciones();
    this.recuperarCompetencias();
    this.recuperarMacrocumunidades();
    this.generacionMunicipios();
    this.generacionParroquias();
  }

  // Función para obtener los roles desde Supabase
  async obtenerRoles() {
    try {
      const loadingToast = await this.toastController.create({
        message: 'Cargando roles...',
        duration: 2000
      });
      await loadingToast.present();

      // Use proper SQL alias syntax with quotes
      const { data, error } = await supabase
        .from('Rol')
        .select('Id_Rol, nombre_rol') // Just select the columns we need without alias
        .eq('estado', true)
        .order('Id_Rol', { ascending: true });

      if (error) {
        console.error('Error al obtener roles:', error.message);
        this.showToast(`Error al cargar roles: ${error.message}`);
        return;
      }

      console.log('Roles obtenidos:', data);
      this.datosrecuperados.roles = data || [];
      this.cdr.detectChanges();

      if (this.datosrecuperados.roles.length === 0) {
        this.showToast('No se encontraron roles activos en el sistema');
      }
    } catch (error: any) {
      console.error('Error inesperado al obtener roles:', error);
      this.showToast(`Error al cargar roles: ${error.message || 'Error desconocido'}`);
    }
  }

  // Función para validar la cédula ecuatoriana
  validarCedula() {
    const cedula = this.usuarioGeneral.CI;
    // Verificar longitud
    if (cedula.length !== 10) {
      this.mensajeValidacionCedula = 'La cédula debe tener 10 dígitos';
      this.showToast(this.mensajeValidacionCedula);
      this.cedulaValidada = false;
      return;
    }
    // Verificar que solo contenga dígitos
    if (!/^\d+$/.test(cedula)) {
      this.mensajeValidacionCedula = 'La cédula debe contener solo números';
      this.showToast(this.mensajeValidacionCedula);
      this.cedulaValidada = false;
      return;
    }
    // Verificar código de provincia
    const codigoProvincia = cedula.substring(0, 2);
    if (!this.provinciasCodigos[codigoProvincia]) {
      this.mensajeValidacionCedula = `Código de provincia inválido: ${codigoProvincia}`;
      this.showToast(this.mensajeValidacionCedula);
      this.cedulaValidada = false;
      return;
    }
    // Algoritmo de validación (Algoritmo 10)
    const digitoVerificador = parseInt(cedula.charAt(9), 10);
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i), 10);

      // Para los dígitos impares (posiciones pares 0,2,4,6,8)
      if (i % 2 === 0) {
        valor = valor * 2;
        if (valor > 9) {
          valor = valor - 9;
        }
      }
      suma += valor;
    }
    const digitoCalculado = 10 - (suma % 10);
    // Si el dígito calculado es 10, se convierte a 0
    const digitoEsperado = (digitoCalculado === 10) ? 0 : digitoCalculado;

    if (digitoVerificador === digitoEsperado) {
      this.mensajeValidacionCedula = 'Cédula validada correctamente';
      this.showSuccessToast(this.mensajeValidacionCedula);
      this.cedulaValidada = true;
      // Verificar si la cédula ya existe en la base de datos
      this.verificarCedulaExistente(cedula);
    } else {
      this.mensajeValidacionCedula = 'La cédula ingresada no es válida';
      this.showToast(this.mensajeValidacionCedula);
      this.cedulaValidada = false;
    }
  }

  // Verificar si la cédula ya existe en la base de datos
  async verificarCedulaExistente(cedula: string) {
    try {
      const { data, error } = await supabase
        .from('Usuario')
        .select('CI_Usuario')
        .eq('CI_Usuario', cedula)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 es el código para "no se encontraron registros"
        console.error('Error al verificar cédula:', error.message);
        return;
      }

      if (data) {
        this.mensajeValidacionCedula = 'Esta cédula ya está registrada en el sistema';
        this.showToast(this.mensajeValidacionCedula);
        this.cedulaValidada = false;
      }
    } catch (error) {
      console.error('Error inesperado al verificar cédula:', error);
    }
  }

  // Confirmar nombres
  confirmarNombres() {
    if (this.usuarioGeneral.Nombre1 && this.usuarioGeneral.Apellido1) {
      this.nombresEdited = true;
      this.camposNombreReadonly = true;
      this.showSuccessToast('Nombres confirmados correctamente');
    } else {
      this.showToast('Por favor ingrese al menos el primer nombre y primer apellido');
    }
  }

  // Función para validar el correo electrónico
  validateEmail(email: string): boolean {
    // Primero validar formato básico del email con dominios comunes
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|mil|biz|info|io|me|tv|co|us|uk|ca|de|jp|fr|au|ru|ch|it|nl|se|no|es|mx)$/i;
    if (!basicEmailRegex.test(email)) {
      this.showToast('Por favor, ingrese un correo electrónico válido con un dominio conocido (.com, .net, .org, etc.)');
      return false;
    }

    // Validar que use un proveedor de correo conocido
    const knownProviderRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|hotmail|yahoo|icloud|aol|protonmail|zoho|mail|gmx|yandex|live|msn|inbox)\.(com|net|org)$/i;
    if (!knownProviderRegex.test(email)) {
      this.showToast('Por favor, utilice un proveedor de correo conocido como Gmail, Outlook, Hotmail, Yahoo, etc.');
      return false;
    }

    return true;
  }

  // Concatenar nombre completo
  concatenarNombreCompleto(): string {
    return `${this.usuarioGeneral.Nombre1} ${this.usuarioGeneral.Nombre2 || ''} ${this.usuarioGeneral.Apellido1} ${this.usuarioGeneral.Apellido2 || ''}`.trim().replace(/\s+/g, ' ');
  }

  // Manejar cambio en tipo de participante
  onTipoParticipanteChange() {
    // No necesitamos cargar datos adicionales ya que lo hicimos al inicio
  }

  // Toast para mensajes de error
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  // Toast para mensajes de éxito
  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'success',
      buttons: [
        {
          icon: 'checkmark',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  // Mostrar loader
  async showLoading(message: string) {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'circles',
    });
    await loading.present();
    return loading;
  }

  // Validar formulario completo
  validateForm(): boolean {
    // Validar datos básicos
    if (!this.usuarioGeneral.CI || !this.cedulaValidada) {
      this.showToast('Por favor ingrese y valide su cédula de identidad');
      return false;
    }

    if (!this.usuarioGeneral.email) {
      this.showToast('Por favor ingrese un correo electrónico');
      return false;
    }

    if (!this.validateEmail(this.usuarioGeneral.email)) {
      return false;
    }

    if (!this.usuarioGeneral.password) {
      this.showToast('Por favor ingrese una contraseña');
      return false;
    }

    if (this.usuarioGeneral.password.length < 6) {
      this.showToast('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (!this.usuarioGeneral.celular) {
      this.showToast('Por favor ingrese un número de teléfono celular');
      return false;
    }

    if (!this.usuarioGeneral.Nombre1 || !this.usuarioGeneral.Apellido1) {
      this.showToast('Por favor ingrese al menos el primer nombre y primer apellido');
      return false;
    }

    if (!this.nombresEdited) {
      this.showToast('Por favor confirme los nombres del usuario');
      return false;
    }

    if (!this.usuarioGeneral.Genero) {
      this.showToast('Por favor seleccione el género');
      return false;
    }

    if (!this.usuarioGeneral.Nacionalidad) {
      this.showToast('Por favor seleccione la nacionalidad');
      return false;
    }

    if (!this.usuarioGeneral.Etnia) {
      this.showToast('Por favor seleccione la autodefinición étnica');
      return false;
    }

    if (!this.usuarioGeneral.fechaNacimiento) {
      this.showToast('Por favor ingrese la fecha de nacimiento');
      return false;
    }

    if (!this.datosbusqueda.selectedProvincia) {
      this.showToast('Por favor seleccione una provincia');
      return false;
    }

    if (!this.usuarioGeneral.canton_reside && this.datosrecuperados.cantones.length > 0) {
      this.showToast('Por favor seleccione un cantón');
      return false;
    }

    // Validar rol
    if (!this.usuarioGeneral.Rol_Usuario) {
      this.showToast('Por favor seleccione un rol para el usuario');
      return false;
    }

    // Validar según tipo de participante
    if (this.usuarioGeneral.tipoParticipante == 1) {
      if (!this.autoridad.cargo) {
        this.showToast('Por favor seleccione el cargo de la autoridad');
        return false;
      }
      if (!this.autoridad.nivelgobierno) {
        this.showToast('Por favor seleccione el nivel de gobierno');
        return false;
      }
      if (!this.autoridad.gadAutoridad) {
        this.showToast('Por favor seleccione el GAD');
        return false;
      }
    } else if (this.usuarioGeneral.tipoParticipante == 2) {
      if (!this.funcionarioGad.cargo) {
        this.showToast('Por favor seleccione el cargo del funcionario');
        return false;
      }
      if (!this.funcionarioGad.nivelgobierno) {
        this.showToast('Por favor seleccione el nivel de gobierno');
        return false;
      }
      if (!this.funcionarioGad.competencias) {
        this.showToast('Por favor seleccione las competencias');
        return false;
      }
      if (!this.funcionarioGad.gadFuncionarioGad) {
        this.showToast('Por favor seleccione el GAD');
        return false;
      }
    } else if (this.usuarioGeneral.tipoParticipante == 3) {
      if (!this.institucion.institucion) {
        this.showToast('Por favor seleccione la institución');
        return false;
      }
      if (!this.institucion.gradoOcupacional) {
        this.showToast('Por favor seleccione el grado ocupacional');
        return false;
      }
      if (!this.institucion.cargo) {
        this.showToast('Por favor seleccione el cargo');
        return false;
      }
    }

    return true;
  }

  // Crear usuario
  async crearUsuario() {
    // Validar el formulario
    if (!this.validateForm()) {
      return;
    }

    try {
      // Mostrar loader
      const loading = await this.showLoading('Creando usuario...');

      // Asignar nombre completo
      this.usuarioGeneral.Nombre = this.concatenarNombreCompleto();

      // Registrar usuario en Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: this.usuarioGeneral.email,
        password: this.usuarioGeneral.password,
        email_confirm: true, // Auto-confirmar email para usuarios creados por admin
        user_metadata: {
          nombre: this.usuarioGeneral.Nombre,
          ci: this.usuarioGeneral.CI,
          rol: this.usuarioGeneral.Rol_Usuario
        }
      });

      if (error) {
        await loading.dismiss();
        this.isLoading = false;

        if (error.message.includes('already registered')) {
          this.showToast('Este correo electrónico ya está registrado');
        } else {
          this.showToast('Error al registrar el usuario: ' + error.message);
        }
        return;
      }

      const user = data.user;
      const UID = user?.id;

      if (!UID) {
        await loading.dismiss();
        this.isLoading = false;
        this.showToast('No se pudo obtener el ID de usuario');
        return;
      }

      // Insertar datos en la tabla Usuario
      const { data: userData, error: insertError } = await supabase
        .from('Usuario')
        .insert([
          {
            Rol_Usuario: this.usuarioGeneral.Rol_Usuario,
            Nombre_Usuario: this.usuarioGeneral.Nombre,
            CI_Usuario: this.usuarioGeneral.CI,
            Fecha_Registro: this.usuarioGeneral.Fecha_Registro,
            Estado_Usuario: this.usuarioGeneral.Estado,
            auth_uid: UID,
            Celular_Usuario: this.usuarioGeneral.celular,
            Convencional_Usuario: this.usuarioGeneral.convencional,
            Genero_Usuario: this.usuarioGeneral.Genero,
            Etnia_Usuario: this.usuarioGeneral.Etnia,
            Nacionalidad_Usuario: this.usuarioGeneral.Nacionalidad,
            Tipo_Participante: this.usuarioGeneral.tipoParticipante,
            Fecha_Nacimiento_Usuario: this.usuarioGeneral.fechaNacimiento,
            Canton_Reside_Usuario: this.usuarioGeneral.canton_reside,
            Parroquia_Reside_Usuario: this.usuarioGeneral.parroquia_reside,
          },
        ])
        .select();

      if (insertError) {
        console.error('Error detallado al insertar usuario:', insertError);
        await loading.dismiss();
        this.isLoading = false;
        this.showToast('Error al guardar los datos del usuario: ' + insertError.message);
        return;
      }

      // Procesar según el tipo de participante
      let secondaryInsertError = null;

      if (this.usuarioGeneral.tipoParticipante == 1) {
        const result = await this.creacionAutoridad(UID);
        secondaryInsertError = result.error;
      } else if (this.usuarioGeneral.tipoParticipante == 2) {
        const result = await this.creacionFuncionarioGad(UID);
        secondaryInsertError = result.error;
      } else if (this.usuarioGeneral.tipoParticipante == 3) {
        const result = await this.creacionInstitucion(UID);
        secondaryInsertError = result.error;
      }

      if (secondaryInsertError) {
        console.error('Error detallado en inserción secundaria:', secondaryInsertError);
        await loading.dismiss();
        this.isLoading = false;
        this.showToast('Error al guardar la información adicional: ' + secondaryInsertError.message);
        return;
      }

      // Cerrar loader
      await loading.dismiss();
      this.isLoading = false;

      // Mostrar alerta de éxito
      const alert = await this.alertController.create({
        header: 'Usuario creado',
        message: 'El usuario ha sido creado correctamente en el sistema.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              // Limpiar formulario o volver a la lista de usuarios
              this.limpiarFormulario();
              this.router.navigate(['/admin/usuarios']);
            }
          }
        ]
      });

      await alert.present();

    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.isLoading = false;

      // Cerrar loading si existe
      const loadingElement = await this.loadingController.getTop();
      if (loadingElement) {
        await this.loadingController.dismiss();
      }

      // Mostrar mensaje de error
      this.showToast('Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo más tarde.');
    }
  }

  // Limpiar formulario
  limpiarFormulario() {
    this.usuarioGeneral = {
      email: '',
      password: '',
      Nombre1: '',
      Nombre2: '',
      Apellido1: '',
      Apellido2: '',
      Rol_Usuario: null,
      Nombre: '',
      CI: '',
      Fecha_Registro: new Date(),
      Estado: 1,
      auth_uid: '',
      Entidad_Usuario: '',
      Firma_Usuario: '',
      celular: '',
      convencional: '',
      Genero: '',
      Etnia: '',
      Nacionalidad: '',
      tipoParticipante: 0,
      fechaNacimiento: '',
      canton_reside: '',
      parroquia_reside: '',
    };

    this.autoridad = {
      cargo: '',
      nivelgobierno: '',
      gadAutoridad: '',
      idUsuario: '',
    };

    this.funcionarioGad = {
      cargo: '',
      competencias: '',
      nivelgobierno: '',
      gadFuncionarioGad: '',
      idUsuario: ''
    };

    this.institucion = {
      institucion: '',
      gradoOcupacional: '',
      cargo: '',
      idUsuario: ''
    };

    this.cedulaValidada = false;
    this.nombresEdited = false;
    this.camposNombreReadonly = false;
    this.mensajeValidacionCedula = '';
  }

  // Crear autoridad
  async creacionAutoridad(UID: string) {
    try {
      return await supabase
        .from('Autoridades')
        .insert([
          {
            Cargo: this.autoridad.cargo,
            Nivel_Gobierno: this.autoridad.nivelgobierno,
            GAD: this.autoridad.gadAutoridad,
            Uid_Usuario: UID,
          },
        ]);
    } catch (error) {
      console.error("Error inesperado al crear la autoridad:", error);
      return { error: { message: 'Error al crear la autoridad' } };
    }
  }

  // Crear funcionario GAD
  async creacionFuncionarioGad(UID: string) {
    try {
      return await supabase
        .from('FuncionarioGAD')
        .insert([
          {
            Cargo: this.funcionarioGad.cargo,
            Competencias: this.funcionarioGad.competencias,
            Nivel_Gobierno: this.funcionarioGad.nivelgobierno,
            GAD: this.funcionarioGad.gadFuncionarioGad,
            Uid_Usuario: UID,
          },
        ]);
    } catch (error) {
      console.error("Error inesperado al crear el funcionario GAD:", error);
      return { error: { message: 'Error al crear el funcionario GAD' } };
    }
  }

  // Crear institución
  async creacionInstitucion(UID: string) {
    try {
      return await supabase
        .from('Instituciones_usuario')
        .insert([
          {
            Institucion: this.institucion.institucion,
            GradoOcupacional: this.institucion.gradoOcupacional,
            Cargo: this.institucion.cargo,
            Uid_Usuario: UID,
          },
        ]);
    } catch (error) {
      console.error("Error inesperado al crear la institución:", error);
      return { error: { message: 'Error al crear la institución' } };
    }
  }

  // Obtener cargos
  async obtenerCargos() {
    try {
      const { data, error } = await supabase
        .from('cargos')
        .select('*');
      if (error) {
        console.error('Error al obtener cargos:', error.message);
        return;
      }
      this.datosrecuperados.cargos = data || [];
    } catch (error) {
      console.error('Error inesperado al obtener cargos:', error);
    }
  }

  // Obtener instituciones
  async obtenerInstituciones() {
    try {
      const { data, error } = await supabase
        .from('instituciones_sistema')
        .select('*');
      if (error) {
        console.error('Error al obtener instituciones:', error.message);
        return;
      }
      this.datosrecuperados.instituciones = data || [];
    } catch (error) {
      console.error('Error inesperado al obtener instituciones:', error);
    }
  }

  // Obtener provincias
  async obtenerProvincias() {
    try {
      const { data, error } = await supabase
        .from('Provincias')
        .select('Codigo_Provincia,Nombre_Provincia')
        .eq('Estado', true);

      if (error) {
        console.error('Error al obtener provincias:', error.message);
        return;
      }
      this.datosrecuperados.provincias = data || [];
    } catch (error) {
      console.error('Error inesperado al obtener provincias:', error);
    }
  }

  // Obtener cantones por provincia
  async obtenerCantones(provinciaId: number) {
    if (!provinciaId) return;
    try {
      const { data, error } = await supabase
        .from('Cantones')
        .select('*')
        .eq('codigo_provincia', provinciaId)
        .eq('estado', true);
      if (error) {
        console.error('Error al obtener cantones:', error.message);
        return;
      }
      this.datosrecuperados.cantones = data || [];
      // Limpiamos las parroquias al cambiar de provincia
      this.datosrecuperados.parroquiasSeleccionadas = [];
      this.usuarioGeneral.parroquia_reside = '';
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error inesperado al obtener cantones:', error);
    }
  }

  // Obtener parroquias por cantón
  async obtenerParroquias(cantonId: string) {
    if (!cantonId) return;
    try {
      const { data, error } = await supabase
        .from('parroquia')
        .select('*')
        .eq('codigo_canton', cantonId)
        .eq('estado', true);
      if (error) {
        console.error('Error al obtener parroquias:', error.message);
        return;
      }
      this.datosrecuperados.parroquiasSeleccionadas = data || [];
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error inesperado al obtener parroquias:', error);
    }
  }

  // Generar lista de municipios
  async generacionMunicipios() {
    try {
      const { data: provincias, error: errorProvincias } = await supabase
        .from('Provincias')
        .select('*')
        .eq('Estado', true);

      if (errorProvincias) {
        console.error('Error al obtener provincias:', errorProvincias.message);
        return;
      }

      const { data: cantones, error: errorCantones } = await supabase
        .from('Cantones')
        .select('*')
        .eq('estado', true);

      if (errorCantones) {
        console.error('Error al obtener cantones:', errorCantones.message);
        return;
      }

      this.datosconcatenar.provinciasConCantones = provincias.map((provincia: any) => {
        const cantonesDeProvincia = cantones.filter((canton: any) => canton.codigo_provincia === provincia.Codigo_Provincia);
        return {
          ...provincia,
          cantones: cantonesDeProvincia
        };
      });

      this.datosrecuperados.municipios = this.datosconcatenar.provinciasConCantones.flatMap((provincia: any) =>
        provincia.cantones.map((canton: any) => ({
          value: `${provincia.Nombre_Provincia}/${canton.nombre_canton}`,
          idCanton: canton.codigo_canton
        }))
      );

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error inesperado al generar municipios:', error);
    }
  }

  // Generar lista de parroquias
  async generacionParroquias() {
    try {
      const { data: provincias, error: errorProvincias } = await supabase
        .from('Provincias')
        .select('*')
        .eq('Estado', true);

      if (errorProvincias) {
        console.error('Error al obtener provincias:', errorProvincias.message);
        return;
      }

      const { data: cantones, error: errorCantones } = await supabase
        .from('Cantones')
        .select('*')
        .eq('estado', true);

      if (errorCantones) {
        console.error('Error al obtener cantones:', errorCantones.message);
        return;
      }

      const { data: parroquias, error: errorParroquias } = await supabase
        .from('parroquia')
        .select('*')
        .eq('estado', true);

      if (errorParroquias) {
        console.error('Error al obtener parroquias:', errorParroquias.message);
        return;
      }

      this.datosconcatenar.provinciasConCantones = provincias.map((provincia: any) => {
        const cantonesDeProvincia = cantones
          .filter((canton: any) => canton.codigo_provincia === provincia.Codigo_Provincia)
          .map((canton: any) => {
            const parroquiasDeCanton = parroquias.filter((parroquia: any) =>
              parroquia.codigo_canton === canton.codigo_canton
            );
            return {
              ...canton,
              parroquias: parroquiasDeCanton
            };
          });
        return {
          ...provincia,
          cantones: cantonesDeProvincia
        };
      });

      this.datosrecuperados.parroquias = this.datosconcatenar.provinciasConCantones.flatMap((provincia: any) =>
        provincia.cantones.flatMap((canton: any) =>
          canton.parroquias.map((parroquia: any) => ({
            value: `${provincia.Nombre_Provincia}/${canton.nombre_canton}/${parroquia.nombre_parroquia}`,
            idParroquia: parroquia.codigo_parroquia
          }))
        )
      );

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error inesperado al generar parroquias:', error);
    }
  }

  // Recuperar competencias
  async recuperarCompetencias() {
    try {
      const { data, error } = await supabase
        .from('competencias')
        .select('*');

      if (error) {
        console.error('Error al obtener las competencias:', error.message);
        return;
      }

      this.datosrecuperados.competencias = data || [];
    } catch (error) {
      console.error('Error inesperado al recuperar competencias:', error);
    }
  }

  // Recuperar mancomunidades
  async recuperarMacrocumunidades() {
    try {
      const { data, error } = await supabase
        .from('mancomunidades')
        .select('*');

      if (error) {
        console.error('Error al obtener mancomunidades:', error);
        return;
      }

      this.datosrecuperados.macrocomunidades = data || [];
    } catch (error) {
      console.error('Error inesperado al recuperar mancomunidades:', error);
    }
  }

  // Manejar cambio en nivel de gobierno
  async onNivelGobiernoChange(nivel_gobierno: string) {
    if (!nivel_gobierno) return;

    try {
      // Los datos ya están cargados previamente en el inicio
      // Solo necesitamos mostrar el selector correspondiente
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al cambiar nivel de gobierno:', error);
    }
  }
}
