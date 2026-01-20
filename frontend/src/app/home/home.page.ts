import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { RecuperacionDataUsuarioService } from '../services/recuperacion-data-usuario.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  // Datos del usuario
  userName: string | null = null;
  userRole: number | null = null;
  roleName: string | null = null;
  modulos: string[] = [];

  // Datos de conferencias
  Capacitaciones: any[] = [];
  capacitacionesDisponibles: any[] = [];
  ConferenciasInscritas: any[] = [];
  cargandoCapacitaciones: boolean = false;

  // Estadísticas
  proximasConferencias: number = 0;
  certificadosDisponibles: number = 0;
  usuariosCount: number = 0;
  conferenciasCount: number = 0;
  certificadosCount: number = 0;

  // Título de la página
  pageTitle: string = 'Inicio';

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router,
    private recuperacionDataUsuarioService: RecuperacionDataUsuarioService
  ) { }

  ngOnInit() {
    // Suscribirse a los cambios en los datos del usuario
    this.recuperacionDataUsuarioService.userName$.subscribe(name => {
      this.userName = name;
      this.actualizarTitulo();
    });

    this.recuperacionDataUsuarioService.userRole$.subscribe(role => {
      this.userRole = role !== null ? Number(role) : null;
    });

    this.recuperacionDataUsuarioService.roleName$.subscribe(roleName => {
      this.roleName = roleName;
      this.actualizarTitulo();
    });

    this.recuperacionDataUsuarioService.modulos$.subscribe(modulos => {
      this.modulos = modulos;
    });

    // Verificar sesión y cargar datos
    this.checkSession();
  }

  async checkSession() {
    await this.recuperacionDataUsuarioService.checkUserSession();
    this.cargarDatos();
  }

  actualizarTitulo() {
    if (this.userName) {
      if (this.roleName === 'Administrador') {
        this.pageTitle = 'Panel Administrativo';
      } else {
        this.pageTitle = 'Mi Portal';
      }
    } else {
      this.pageTitle = 'Bienvenido';
    }
  }

  async cargarDatos() {
    if (this.userName) {
      // Usuario autenticado - cargar datos relevantes
      await this.RecuperarCapacitaciones();
      await this.RecuperarConferenciasInscrito();

      // Calcular estadísticas
      this.calcularEstadisticas();

      if (this.roleName === 'Administrador') {
        await this.cargarEstadisticasAdmin();
      }
    }
  }

  async RecuperarCapacitaciones() {
    this.cargandoCapacitaciones = true;
    try {
      const { data, error } = await supabase.from('Capacitaciones').select('*');
      if (error) {
        console.error('Error al obtener conferencias:', error.message);
        return;
      }
      this.Capacitaciones = data ?? [];
      this.capacitacionesDisponibles = this.Capacitaciones.filter(c => c.Estado === 0);
    } catch (error) {
      console.error('Error al cargar capacitaciones:', error);
    } finally {
      this.cargandoCapacitaciones = false;
    }
  }

  async RecuperarConferenciasInscrito() {
    try {
      const { data: usuario, error } = await supabase.auth.getUser();
      if (error || !usuario?.user) {
        console.error('Error al obtener usuario:', error?.message);
        return;
      }
      const idUsuario = await this.recuperarDataUsuario(usuario.user.id);

      // Recuperamos los Id_Capacitacion en las que está inscrito el usuario
      const { data: inscripciones, error: inscripcionesError } = await supabase
        .from('Usuarios_Capacitaciones')
        .select('Id_Capacitacion')
        .eq('Id_Usuario', idUsuario);

      if (inscripcionesError) {
        console.error('Error al recuperar inscripciones:', inscripcionesError.message);
        return;
      }

      // Si el usuario está inscrito en alguna conferencia
      if (inscripciones?.length) {
        const capacitacionIds = inscripciones.map((item: any) => item.Id_Capacitacion);
        // Ahora recuperamos las capacitaciones correspondientes
        const { data: capacitaciones, error: capacitacionesError } = await supabase
          .from('Capacitaciones')
          .select('*')
          .in('Id_Capacitacion', capacitacionIds);

        if (capacitacionesError) {
          console.error('Error al obtener capacitaciones inscritas:', capacitacionesError.message);
          return;
        }

        // Almacenamos las capacitaciones en el array
        this.ConferenciasInscritas = capacitaciones ?? [];
      }
    } catch (error) {
      console.error('Error al recuperar conferencias inscritas:', error);
    }
  }

  async recuperarDataUsuario(authUid: string) {
    const { data, error } = await supabase
      .from('Usuario')
      .select('Id_Usuario')
      .eq('auth_uid', authUid)
      .single();
    if (error) {
      console.error('Error al recuperar el Id_Usuario:', error.message);
      return null;
    }
    return data?.Id_Usuario;
  }

  calcularEstadisticas() {
    // Para usuarios normales
    this.proximasConferencias = this.ConferenciasInscritas.filter(c => c.Estado === 0).length;
    this.certificadosDisponibles = this.ConferenciasInscritas.filter(c => c.Estado === 1).length;
  }

  async cargarEstadisticasAdmin() {
    try {
      // Contar usuarios
      const { count: userCount, error: userError } = await supabase
        .from('Usuario')
        .select('*', { count: 'exact', head: true });

      if (!userError) {
        this.usuariosCount = userCount || 0;
      }

      // Contar conferencias
      const { count: confCount, error: confError } = await supabase
        .from('Capacitaciones')
        .select('*', { count: 'exact', head: true });

      if (!confError) {
        this.conferenciasCount = confCount || 0;
      }

      // Para simplificar, usamos la misma cantidad de conferencias completadas como certificados
      const { count: certCount, error: certError } = await supabase
        .from('Capacitaciones')
        .select('*', { count: 'exact', head: true })
        .eq('Estado', 1);

      if (!certError) {
        this.certificadosCount = certCount || 0;
      }
    } catch (error) {
      console.error('Error al cargar estadísticas admin:', error);
    }
  }

  // Función para inscribirse en una conferencia
  async inscribirse(idCapacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Procesando inscripción...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data: usuario, error } = await supabase.auth.getUser();
      if (error || !usuario?.user) {
        const toast = await this.toastController.create({
          message: 'Por favor, inicie sesión para inscribirse.',
          duration: 3000,
          position: 'top',
          color: 'warning'
        });
        toast.present();
        return;
      }

      // Obtener el ID de usuario desde la base de datos usando el auth_uid
      const idUsuario = await this.recuperarDataUsuario(usuario.user.id);
      if (!idUsuario) {
        const toast = await this.toastController.create({
          message: 'Error al obtener el ID de usuario.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        toast.present();
        return;
      }

      // Insertar el registro de inscripción en la tabla intermedia
      const { data, error: inscripcionError } = await supabase
        .from('Usuarios_Capacitaciones')
        .insert([
          {
            Id_Usuario: idUsuario,
            Id_Capacitacion: idCapacitacion,
            Rol_Capacitacion: 'Participante',
            Asistencia: false,
          },
        ]);

      if (inscripcionError) {
        console.error('Error al inscribirse:', inscripcionError.message);
        const toast = await this.toastController.create({
          message: 'Hubo un error al inscribirse en la conferencia.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        toast.present();
      } else {
        const toast = await this.toastController.create({
          message: '¡Te has inscrito exitosamente en la conferencia!',
          duration: 3000,
          position: 'top',
          color: 'success'
        });
        toast.present();

        // Actualizar los datos
        await this.RecuperarConferenciasInscrito();
        this.calcularEstadisticas();
      }
    } catch (error) {
      console.error('Error en inscripción:', error);
      const toast = await this.toastController.create({
        message: 'Error en el proceso de inscripción.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      toast.present();
    } finally {
      loading.dismiss();
    }
  }

  // Función para cancelar la inscripción
  async cancelarInscripcion(idCapacitacion: number) {
    const loading = await this.loadingController.create({
      message: 'Procesando cancelación...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const { data: usuario, error } = await supabase.auth.getUser();
      if (error || !usuario?.user) {
        const toast = await this.toastController.create({
          message: 'Por favor, inicie sesión para cancelar la inscripción.',
          duration: 3000,
          position: 'top',
          color: 'warning'
        });
        toast.present();
        return;
      }

      const idUsuario = await this.recuperarDataUsuario(usuario.user.id);
      if (!idUsuario) {
        const toast = await this.toastController.create({
          message: 'Error al obtener el ID de usuario.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        toast.present();
        return;
      }

      // Eliminar el registro de inscripción
      const { data, error: cancelacionError } = await supabase
        .from('Usuarios_Capacitaciones')
        .delete()
        .eq('Id_Usuario', idUsuario)
        .eq('Id_Capacitacion', idCapacitacion);

      if (cancelacionError) {
        console.error('Error al cancelar inscripción:', cancelacionError.message);
        const toast = await this.toastController.create({
          message: 'Hubo un error al cancelar la inscripción.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        toast.present();
      } else {
        const toast = await this.toastController.create({
          message: 'Inscripción cancelada exitosamente.',
          duration: 3000,
          position: 'top',
          color: 'success'
        });
        toast.present();

        // Actualizar datos
        await this.RecuperarConferenciasInscrito();
        this.calcularEstadisticas();
      }
    } catch (error) {
      console.error('Error en cancelación:', error);
      const toast = await this.toastController.create({
        message: 'Error en el proceso de cancelación.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      toast.present();
    } finally {
      loading.dismiss();
    }
  }

  // Verificar si el usuario está inscrito en una capacitación
  isInscrito(idCapacitacion: number): boolean {
    return this.ConferenciasInscritas.some(c => c.Id_Capacitacion === idCapacitacion);
  }

  // Verificar si se puede mostrar el botón de inscripción
  puedeInscribirse(capacitacion: any): boolean {
    return capacitacion.Estado === 0 && !this.isInscrito(capacitacion.Id_Capacitacion);
  }

  // Verificar si se puede mostrar el botón de cancelar inscripción
  puedeCancelarInscripcion(capacitacion: any): boolean {
    return capacitacion.Estado === 0 && this.isInscrito(capacitacion.Id_Capacitacion);
  }

  // Navegar al login
  iraLogin() {
    this.router.navigate(['/login']);
  }

  // Navegar a un módulo
  navegarModulo(modulo: string) {
    // Mapeo específico para rutas de módulos
    const rutasModulos: { [key: string]: string } = {
      'Gestionar roles': 'gestionar-roles',
      'Gestionar capacitación': 'gestionar-capacitaciones',
      'Gestionar capacitaciones': 'gestionar-capacitaciones',
      'Gestionar usuarios': 'gestionar-usuarios',
      'Gestionar entidades': 'gestionar-entidades',
      'Gestionar provincias': 'gestionar-provincias',
      'Gestionar cantones': 'gestionar-cantones',
      'Gestionar parroquias': 'gestionar-parroquias',
      'Gestionar competencias': 'gestionar-competencias',
      'Gestionar instituciones': 'gestionar-instituciones',
      'Gestionar cargos instituciones': 'gestionar-cargos-instituciones',
      'Ver Perfil': 'ver-perfil',
      'Ver conferencias': 'ver-conferencias',
      'Ver certificaciones': 'ver-certificaciones',
      'Validar certificados': 'validar-certificados'
    };

    // Obtener la ruta correcta del mapeo o convertir a kebab-case
    const ruta = rutasModulos[modulo] || modulo.toLowerCase().replace(/\s+/g, '-');

    console.log(`Navegando a: /${ruta}`);
    this.router.navigate([`/${ruta}`]);
  }

  // Editar capacitación (para admin)
  editarCapacitacion(idCapacitacion: number) {
    this.router.navigate([`/gestionar-capacitaciones/editar/${idCapacitacion}`]);
  }

  // Obtener icono según el módulo
  getIconForModule(modulo: string): string {
    const iconMap: { [key: string]: string } = {
      'Gestionar roles': 'people-outline',
      'Gestionar capacitación': 'calendar-outline',
      'Gestionar capacitaciones': 'calendar-outline',
      'Gestionar usuarios': 'person-add-outline',
      'Gestionar entidades': 'business-outline',
      'Gestionar provincias': 'map-outline',
      'Gestionar cantones': 'location-outline',
      'Gestionar parroquias': 'pin-outline',
      'Gestionar competencias': 'ribbon-outline',
      'Gestionar instituciones': 'briefcase-outline',
      'Gestionar cargos instituciones': 'id-card-outline',
      'Ver Perfil': 'person-outline',
      'Ver conferencias': 'list-outline',
      'Ver certificaciones': 'document-text-outline',
      'Ver certificados': 'document-text-outline',
      'Validar certificados': 'qr-code-outline'
    };

    return iconMap[modulo] || 'apps-outline';
  }
}
