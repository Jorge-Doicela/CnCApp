import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, 
  IonBackButton, IonContent, IonSpinner, IonIcon,
  IonProgressBar, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  school, book, medal, ribbon, footsteps, timer, 
  calendar, shieldCheckmark, fingerPrint, personCircle,
  checkmarkCircle, lockClosed, star, diamond, flashlight
} from 'ionicons/icons';
import { firstValueFrom, finalize, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { AuthService } from 'src/app/features/auth/services/auth.service';

interface Achievement {
  id: string;
  idTrack: 'academico' | 'lealtad' | 'identidad';
  title: string;
  description: string;
  icon: string;
  color: string;
  level: string;
  criteria: string;
  isUnlocked: boolean;
  progress: number;
  currentValue?: any;
  targetValue?: any;
  longDescription: string;
  rewardInfo?: string;
  lockedDescription?: string;
}

@Component({
  selector: 'app-logros',
  templateUrl: './logros.page.html',
  styleUrls: ['./logros.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, 
    IonBackButton, IonContent, IonSpinner, IonIcon,
    IonProgressBar, IonModal
  ]
})
export class LogrosPage implements OnInit {
  cargando: boolean = true;
  usuario: any = null;
  selectedAchievement: Achievement | null = null;
  mostrarModal: boolean = false;
  tracks: { id: string, name: string, icon: string, color: string, summary: string, achievements: Achievement[] }[] = [];

  // Cache estático similar a PerfilPage
  private static logrosCache: any = null;
  private static ultimaCargaLogros: number = 0;
  private readonly CACHE_TTL = 300000; // 5 minutos

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private secureStorage = inject(SecureStorageService);
  private authService = inject(AuthService);

  constructor() {
    addIcons({
      school, book, medal, ribbon, footsteps, timer, 
      calendar, shieldCheckmark, fingerPrint, personCircle,
      checkmarkCircle, lockClosed, star, diamond, flashlight
    });
  }

  ngOnInit() {
    this.cargarPerfil();
  }

  async cargarPerfil() {
    // 1. Estrategia SWR: Cargar datos básicos de AuthService inmediatamente
    const current = this.authService.currentUser();
    if (current && !this.usuario) {
      this.usuario = {
        ...current,
        Nombre_Usuario: current.nombre,
        fotoPerfilUrl: current.fotoPerfilUrl
      };
      this.cargando = false;
      this.calcularCaminos(0, 0, current.fotoPerfilUrl ? true : false, false, false, 0);
    }

    // 2. Cache estático
    const ahora = Date.now();
    if (LogrosPage.logrosCache && (ahora - LogrosPage.ultimaCargaLogros < this.CACHE_TTL)) {
      this.usuario = LogrosPage.logrosCache;
      this.cargando = false;
      this.actualizarLogrosDesdeUsuario(this.usuario);
      this.cdr.detectChanges();
      
      if (ahora - LogrosPage.ultimaCargaLogros < 10000) return;
    }

    if (!this.usuario) this.cargando = true;
    
    this.http.get<any>(`${environment.apiUrl}/users/me`).pipe(
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (usuario: any) => {
        this.usuario = usuario;
        
        // Actualizar cache
        LogrosPage.logrosCache = usuario;
        LogrosPage.ultimaCargaLogros = Date.now();
        
        this.actualizarLogrosDesdeUsuario(usuario);
      },
      error: (err) => {
        console.error('Error al cargar perfil para logros:', err);
      }
    });
  }

  private async actualizarLogrosDesdeUsuario(usuario: any) {
    const inscritos = usuario._count?.inscripciones || 0;
    const certs = usuario._count?.certificados || 0;
    const tieneFoto = !!usuario.fotoPerfilUrl;
    const tieneFirma = !!usuario.firmaUrl;
    
    // Antigüedad (meses)
    let mesesAntiguedad = 0;
    if (usuario.createdAt) {
      const creacion = new Date(usuario.createdAt);
      const hoy = new Date();
      mesesAntiguedad = (hoy.getFullYear() - creacion.getFullYear()) * 12 + (hoy.getMonth() - creacion.getMonth());
    }

    // Verificar biometría de forma asíncrona pero sin bloquear la UI
    const biometriaActiva = (await this.secureStorage.get('biometria_activada')) === 'true';
    
    this.calcularCaminos(inscritos, certs, tieneFoto, tieneFirma, biometriaActiva, mesesAntiguedad);
    this.cdr.detectChanges();
  }

  calcularCaminos(
    inscritos: number, 
    certs: number, 
    tieneFoto: boolean, 
    tieneFirma: boolean, 
    biometriaActiva: boolean, 
    mesesAntiguedad: number
  ) {
    this.tracks = [
      {
        id: 'academico',
        name: 'Trayecto Académico',
        icon: 'school',
        color: 'primary',
        summary: 'Tu evolución a través del aprendizaje y certificaciones.',
        achievements: [
          {
            id: 'aca_1', idTrack: 'academico', title: 'Nuevos Horizontes', icon: 'book', color: 'primary', level: 'Bronce',
            description: 'Tu primera incursión en el aprendizaje.', isUnlocked: inscritos >= 1,
            longDescription: 'Este logro se otorga al inscribirse en la primera capacitación. Es el primer paso de un largo camino de conocimiento.',
            progress: Math.min(inscritos / 1, 1), criteria: '1 Curso', currentValue: inscritos, targetValue: 1
          },
          {
            id: 'aca_2', idTrack: 'academico', title: 'Cazador de Éxitos', icon: 'ribbon', color: 'secondary', level: 'Plata',
            description: 'Obtención del primer certificado oficial.', isUnlocked: certs >= 1,
            longDescription: 'Has demostrado tu competencia al completar satisfactoriamente tu primera certificación oficial.',
            progress: Math.min(certs / 1, 1), criteria: '1 Certificado', currentValue: certs, targetValue: 1
          },
          {
            id: 'aca_3', idTrack: 'academico', title: 'Mente Inquieta', icon: 'school', color: 'warning', level: 'Oro',
            description: 'Participación en 5 capacitaciones.', isUnlocked: inscritos >= 5,
            longDescription: 'Tu curiosidad no tiene límites. Has participado en 5 procesos de formación diferentes.',
            progress: Math.min(inscritos / 5, 1), criteria: '5 Cursos', currentValue: inscritos, targetValue: 5
          },
          {
            id: 'aca_4', idTrack: 'academico', title: 'Saber Validado', icon: 'medal', color: 'warning', level: 'Oro',
            description: 'Colección de 3 certificaciones.', isUnlocked: certs >= 3,
            longDescription: 'No solo aprendes, sino que dominas. 3 certificados avalan tu trayectoria profesional.',
            progress: Math.min(certs / 3, 1), criteria: '3 Certificados', currentValue: certs, targetValue: 3
          },
          {
            id: 'aca_5', idTrack: 'academico', title: 'Maestro del Saber', icon: 'flashlight', color: 'tertiary', level: 'Diamante',
            description: '10 capacitaciones en tu expediente.', isUnlocked: inscritos >= 10,
            longDescription: 'Eres un referente en la plataforma. Tu dedicación al estudio es ejemplar.',
            progress: Math.min(inscritos / 10, 1), criteria: '10 Cursos', currentValue: inscritos, targetValue: 10
          },
          {
            id: 'aca_6', idTrack: 'academico', title: 'Leyenda Académica', icon: 'star', color: 'tertiary', level: 'Élite',
            description: 'Dominio absoluto con 5+ certificados.', isUnlocked: certs >= 5,
            longDescription: 'Has alcanzado la cima del reconocimiento académico. Pocos llegan a este nivel de certificación.',
            progress: Math.min(certs / 5, 1), criteria: '5 Certificados', currentValue: certs, targetValue: 5
          }
        ]
      },
      {
        id: 'lealtad',
        name: 'Trayecto de Lealtad',
        icon: 'timer',
        color: 'secondary',
        summary: 'Reconocimiento por tu constancia y tiempo con nosotros.',
        achievements: [
          {
            id: 'lea_1', idTrack: 'lealtad', title: 'Primer Contacto', icon: 'footsteps', color: 'medium', level: 'Inicio',
            description: 'Registro completado con éxito.', isUnlocked: true,
            longDescription: 'El inicio de tu historia en CnCApp. ¡Bienvenido a bordo!',
            progress: 1, criteria: 'Registro'
          },
          {
            id: 'lea_2', idTrack: 'lealtad', title: 'Crecimiento Continuo', icon: 'calendar', color: 'primary', level: 'Bronce',
            description: 'Un mes de actividad constante.', isUnlocked: mesesAntiguedad >= 1,
            longDescription: 'Has formado parte de nuestra comunidad por un mes completo. Tu compromiso empieza a dar frutos.',
            progress: Math.min(mesesAntiguedad / 1, 1), criteria: '1 Mes', currentValue: mesesAntiguedad, targetValue: 1
          },
          {
            id: 'lea_3', idTrack: 'lealtad', title: 'Pilar de la Comunidad', icon: 'shield-checkmark', color: 'secondary', level: 'Plata',
            description: 'Seis meses de fidelidad.', isUnlocked: mesesAntiguedad >= 6,
            longDescription: 'Medio año transformando tu futuro profesional con nosotros. Eres un miembro valioso de CnCApp.',
            progress: Math.min(mesesAntiguedad / 6, 1), criteria: '6 Meses', currentValue: mesesAntiguedad, targetValue: 6
          },
          {
            id: 'lea_4', idTrack: 'lealtad', title: 'Aniversario de Oro', icon: 'diamond', color: 'tertiary', level: 'Oro',
            description: 'Un año de trayectoria ininterrumpida.', isUnlocked: mesesAntiguedad >= 12,
            longDescription: '¡Felicidades! Un año completo dedicado al crecimiento y la excelencia.',
            progress: Math.min(mesesAntiguedad / 12, 1), criteria: '1 Año', currentValue: mesesAntiguedad, targetValue: 12
          }
        ]
      },
      {
        id: 'identidad',
        name: 'Trayecto de Identidad',
        icon: 'person-circle',
        color: 'success',
        summary: 'Seguridad y personalización de tu entorno digital.',
        achievements: [
          {
            id: 'ide_1', idTrack: 'identidad', title: 'Imagen Profesional', icon: 'person-circle', color: 'primary', level: 'Bronce',
            description: 'Personalización de tu perfil.', isUnlocked: tieneFoto,
            longDescription: 'Has proyectado tu imagen profesional configurando tu foto de perfil.',
            progress: tieneFoto ? 1 : 0, criteria: 'Foto Perfil'
          },
          {
            id: 'ide_2', idTrack: 'identidad', title: 'Rastro de Confianza', icon: 'brush', color: 'success', level: 'Plata',
            description: 'Vinculación de firma digital.', isUnlocked: tieneFirma,
            longDescription: 'Tu cuenta ahora cuenta con validez legal interna gracias a tu firma digital vinculada.',
            progress: tieneFirma ? 1 : 0, criteria: 'Firma Digital'
          },
          {
            id: 'ide_3', idTrack: 'identidad', title: 'Guardián Digital', icon: 'finger-print', color: 'warning', level: 'Oro',
            description: 'Activación de acceso biométrico.', isUnlocked: biometriaActiva,
            longDescription: 'Has elevado los estándares de seguridad de tu cuenta al máximo nivel con biometría.',
            progress: biometriaActiva ? 1 : 0, criteria: 'Biometría'
          },
          {
            id: 'ide_4', idTrack: 'identidad', title: 'Perfil Élite', icon: 'checkmark-circle', color: 'tertiary', level: 'Diamante',
            description: 'Identidad y seguridad al 100%.', isUnlocked: tieneFoto && tieneFirma && biometriaActiva,
            longDescription: 'Tu perfil es un modelo a seguir: completo, verificado y ultra seguro.',
            progress: ( (tieneFoto ? 1 : 0) + (tieneFirma ? 1 : 0) + (biometriaActiva ? 1 : 0) ) / 3, 
            criteria: 'Todo Completo'
          }
        ]
      }
    ];
  }

  openDetail(achievement: Achievement) {
    this.selectedAchievement = achievement;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    setTimeout(() => this.selectedAchievement = null, 300);
  }

  getTrackProgress(trackId: string): number {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) return 0;
    const unlocked = track.achievements.filter(a => a.isUnlocked).length;
    return (unlocked / track.achievements.length);
  }

  getUnlockedCount(): number {
    let count = 0;
    this.tracks.forEach(t => {
      count += t.achievements.filter(a => a.isUnlocked).length;
    });
    return count;
  }

  getTotalCount(): number {
    let count = 0;
    this.tracks.forEach(t => count += t.achievements.length);
    return count;
  }
}
