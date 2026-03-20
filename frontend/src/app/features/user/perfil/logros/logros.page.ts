import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonButtons, IonTitle, 
  IonBackButton, IonContent, IonSpinner, IonIcon, IonBadge,
  IonProgressBar
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
  progress: number; // 0 to 1
  currentValue?: any;
  targetValue?: any;
}

@Component({
  selector: 'app-logros',
  templateUrl: './logros.page.html',
  styleUrls: ['./logros.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    IonHeader, IonToolbar, IonButtons, IonTitle, 
    IonBackButton, IonContent, IonSpinner, IonIcon, IonBadge,
    IonProgressBar
  ]
})
export class LogrosPage implements OnInit {
  cargando: boolean = true;
  usuario: any = null;
  tracks: { id: string, name: string, icon: string, achievements: Achievement[] }[] = [];

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private secureStorage = inject(SecureStorageService);

  constructor() {
    addIcons({
      school, book, medal, ribbon, footsteps, timer, 
      calendar, shieldCheckmark, fingerPrint, personCircle,
      checkmarkCircle, lockClosed, star, diamond, flashlight
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      const resp: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/users/me`).pipe(timeout(10000))
      );
      this.usuario = resp;

      // Verificar biometría local
      let biometriaActiva = false;
      try {
        const value = await this.secureStorage.get('biometria_activada');
        biometriaActiva = value === 'true';
      } catch (e) {}

      this.calcularCaminos(biometriaActiva);
    } catch (error) {
      console.error('Error al cargar datos para logros:', error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  calcularCaminos(biometriaActiva: boolean = false) {
    if (!this.usuario) return;

    const inscritos = this.usuario._count?.inscripciones || 0;
    const certs = this.usuario._count?.certificados || 0;
    const fechaRegistro = new Date(this.usuario.createdAt || new Date());
    const hoy = new Date();
    const mesesAntiguedad = (hoy.getFullYear() - fechaRegistro.getFullYear()) * 12 + (hoy.getMonth() - fechaRegistro.getMonth());
    
    const tieneFoto = this.usuario.fotoPerfilUrl && !this.usuario.fotoPerfilUrl.includes('placeholder');
    const tieneFirma = !!this.usuario.firmaUrl;
    // Biometría ya viene por parámetro desde el storage local

    this.tracks = [
      {
        id: 'academico',
        name: 'Trayecto Académico',
        icon: 'school',
        achievements: [
          {
            id: 'aca_1', idTrack: 'academico', title: 'Primeras Letras', icon: 'book', color: 'primary', level: 'Bronce',
            description: 'Inscríbete en tu primera capacitación.', isUnlocked: inscritos >= 1,
            progress: Math.min(inscritos / 1, 1), criteria: '1 Curso', currentValue: inscritos, targetValue: 1
          },
          {
            id: 'aca_2', idTrack: 'academico', title: 'Cazador de Certificados', icon: 'ribbon', color: 'secondary', level: 'Plata',
            description: 'Obtén tu primer certificado oficial.', isUnlocked: certs >= 1,
            progress: Math.min(certs / 1, 1), criteria: '1 Certificado', currentValue: certs, targetValue: 1
          },
          {
            id: 'aca_3', idTrack: 'academico', title: 'Estudiante Constante', icon: 'school', color: 'warning', level: 'Oro',
            description: 'Participa en 5 capacitaciones diferentes.', isUnlocked: inscritos >= 5,
            progress: Math.min(inscritos / 5, 1), criteria: '5 Cursos', currentValue: inscritos, targetValue: 5
          },
          {
            id: 'aca_4', idTrack: 'academico', title: 'Experto en la Materia', icon: 'medal', color: 'warning', level: 'Oro',
            description: 'Logra completar 3 certificaciones.', isUnlocked: certs >= 3,
            progress: Math.min(certs / 3, 1), criteria: '3 Certificados', currentValue: certs, targetValue: 3
          },
          {
            id: 'aca_5', idTrack: 'academico', title: 'Maestro del Saber', icon: 'flashlight', color: 'tertiary', level: 'Diamante',
            description: 'Inscríbete en 10 capacitaciones.', isUnlocked: inscritos >= 10,
            progress: Math.min(inscritos / 10, 1), criteria: '10 Cursos', currentValue: inscritos, targetValue: 10
          }
        ]
      },
      {
        id: 'lealtad',
        name: 'Trayecto de Lealtad',
        icon: 'timer',
        achievements: [
          {
            id: 'lea_1', idTrack: 'lealtad', title: '¡Hola, Mundo!', icon: 'footsteps', color: 'medium', level: 'Inicio',
            description: 'Forma parte de la comunidad CnCApp.', isUnlocked: true,
            progress: 1, criteria: 'Registro'
          },
          {
            id: 'lea_2', idTrack: 'lealtad', title: 'Miembro Activo', icon: 'calendar', color: 'primary', level: 'Bronce',
            description: 'Mantén tu cuenta activa por 1 mes.', isUnlocked: mesesAntiguedad >= 1,
            progress: Math.min(mesesAntiguedad / 1, 1), criteria: '1 Mes', currentValue: mesesAntiguedad, targetValue: 1
          },
          {
            id: 'lea_3', idTrack: 'lealtad', title: 'Comprometido', icon: 'star', color: 'secondary', level: 'Plata',
            description: '6 meses de aprendizaje continuo.', isUnlocked: mesesAntiguedad >= 6,
            progress: Math.min(mesesAntiguedad / 6, 1), criteria: '6 Meses', currentValue: mesesAntiguedad, targetValue: 6
          },
          {
            id: 'lea_4', idTrack: 'lealtad', title: 'Veterano CnC', icon: 'diamond', color: 'tertiary', level: 'Leyenda',
            description: 'Cumple 1 año en la plataforma.', isUnlocked: mesesAntiguedad >= 12,
            progress: Math.min(mesesAntiguedad / 12, 1), criteria: '1 Año', currentValue: mesesAntiguedad, targetValue: 12
          }
        ]
      },
      {
        id: 'identidad',
        name: 'Trayecto de Identidad',
        icon: 'person-circle',
        achievements: [
          {
            id: 'ide_1', idTrack: 'identidad', title: 'Identidad Digital', icon: 'person-circle', color: 'primary', level: 'Bronce',
            description: 'Configura tu foto de perfil real.', isUnlocked: tieneFoto,
            progress: tieneFoto ? 1 : 0, criteria: 'Foto Perfil'
          },
          {
            id: 'ide_2', idTrack: 'identidad', title: 'Ciudadano Verificado', icon: 'shield-checkmark', color: 'success', level: 'Plata',
            description: 'Vincula tu firma digital a la cuenta.', isUnlocked: tieneFirma,
            progress: tieneFirma ? 1 : 0, criteria: 'Firma Digital'
          },
          {
            id: 'ide_3', idTrack: 'identidad', title: 'Bóveda de Seguridad', icon: 'lock-closed', color: 'warning', level: 'Oro',
            description: 'Activa el acceso por biometría.', isUnlocked: biometriaActiva,
            progress: biometriaActiva ? 1 : 0, criteria: 'Biometría'
          }
        ]
      }
    ];
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
