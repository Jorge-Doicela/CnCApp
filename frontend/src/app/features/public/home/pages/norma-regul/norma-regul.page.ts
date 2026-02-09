// norma-regul.page.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonContent, IonCard, IonCardContent,
  IonItem, IonLabel, IonIcon,
  IonButton, IonInput,
  IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, search, arrowForward, downloadOutline,
  eyeOutline, arrowUpOutline, notificationsOutline,
  documentTextOutline, bookOutline, schoolOutline,
  briefcaseOutline, filterOutline, calendarOutline,
  chevronForwardOutline, closeOutline, documentOutline,
  listOutline, calculatorOutline, settingsOutline,
  statsChartOutline, fileTrayFullOutline, barChartOutline,
  libraryOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-norma-regul',
  templateUrl: './norma-regul.page.html',
  styleUrls: ['./norma-regul.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton,
    IonTitle, IonContent, IonCard, IonCardContent,
    IonItem, IonLabel, IonIcon,
    IonButton, IonInput,
    IonSelect, IonSelectOption
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NormaRegulPage implements OnInit {
  searchTerm: string = '';
  filtroTipo: string = 'todos';
  filtroAnio: string = 'todos';
  suscripcionEmail: string = '';
  filteredDocumentos: any[] = [];
  mostrandoResultados: boolean = false;
  resultadosTitulo: string = '';
  mostrandoTodas: boolean = false;

  // Datos completos para documentos normativos
  documentos: any[] = [
    {
      id: 'constitucion',
      nombre: 'Constitución de la República del Ecuador',
      tipo: 'constitucion',
      anio: '2008',
      descripcion: 'Artículos 238-241, 251-252, 260-269. Disposiciones para la organización territorial del Estado, régimen de competencias y sistema nacional de competencias.',
      url: 'https://www.oas.org/juridico/pdfs/mesicic4_ecu_const.pdf'
    },
    {
      id: 'cootad',
      nombre: 'Código Orgánico de Organización Territorial, Autonomía y Descentralización',
      tipo: 'leyes',
      anio: '2010',
      descripcion: 'Establece la organización político-administrativa del Estado, el régimen de los diferentes niveles de gobiernos autónomos descentralizados y los regímenes especiales.',
      url: 'https://www.oas.org/juridico/pdfs/mesicic4_ecu_org.pdf'
    },
    {
      id: 'copfp',
      nombre: 'Código Orgánico de Planificación y Finanzas Públicas',
      tipo: 'leyes',
      anio: '2010',
      descripcion: 'Regula el ejercicio de las competencias de planificación y el ejercicio de la política pública en todos los niveles de gobierno.',
      url: 'https://www.finanzas.gob.ec/wp-content/uploads/downloads/2012/09/CODIGO_PLANIFICACION_FINAZAS.pdf'
    },
    {
      id: 'resolucion-transito',
      nombre: 'Resolución Nro. 006-CNC-2012',
      tipo: 'resoluciones',
      anio: '2012',
      descripcion: 'Transferencia de competencia para planificar, regular y controlar el tránsito, el transporte terrestre y la seguridad vial a favor de los GAD.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2015/10/Resolucion-No.-006-CNC-2012.pdf'
    },
    {
      id: 'resolucion-riego',
      nombre: 'Resolución Nro. 008-CNC-2011',
      tipo: 'resoluciones',
      anio: '2011',
      descripcion: 'Transferencia de la competencia de riego y drenaje a los Gobiernos Autónomos Descentralizados provinciales.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2015/10/Resolucion-No.-008-CNC-2011.pdf'
    },
    {
      id: 'resolucion-ambiental',
      nombre: 'Resolución Nro. 005-CNC-2014',
      tipo: 'resoluciones',
      anio: '2014',
      descripcion: 'Transferencia de la competencia de gestión ambiental a los GAD provinciales, municipales y parroquiales rurales.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2015/10/Resolucion-No.-005-CNC-2014.pdf'
    },
    {
      id: 'resolucion-aridos',
      nombre: 'Resolución Nro. 004-CNC-2014',
      tipo: 'resoluciones',
      anio: '2014',
      descripcion: 'Transferencia de la competencia para regular, autorizar y controlar la explotación de materiales áridos y pétreos a los GAD municipales.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2015/10/Resolucion-No.-004-CNC-2014.pdf'
    },
    {
      id: 'resolucion-turismo',
      nombre: 'Resolución Nro. 001-CNC-2016',
      tipo: 'resoluciones',
      anio: '2016',
      descripcion: 'Transferencia de la competencia de turismo a los GAD provinciales, municipales y metropolitanos.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2016/03/Resolucion-No.-001-CNC-2016.pdf'
    },
    {
      id: 'guia-competencias',
      nombre: 'Guía Metodológica para el Ejercicio de Competencias',
      tipo: 'guias',
      anio: '2022',
      descripcion: 'Documento técnico que orienta a los GAD en la implementación y ejercicio de las competencias transferidas.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2022/01/guia-metodologica-competencias.pdf'
    },
    {
      id: 'manual-costeo',
      nombre: 'Manual de Costeo de Competencias',
      tipo: 'guias',
      anio: '2018',
      descripcion: 'Establece la metodología para determinar los recursos necesarios para el ejercicio de las competencias.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2018/06/manual-costeo-competencias.pdf'
    },
    {
      id: 'modelo-gestion',
      nombre: 'Modelos de Gestión por Competencias',
      tipo: 'guias',
      anio: '2020',
      descripcion: 'Modelos de gestión diferenciados según capacidad operativa de los GAD para el ejercicio de competencias.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2020/03/modelos-gestion-competencias.pdf'
    },
    {
      id: 'informe-descentralizacion',
      nombre: 'Informe Anual de Descentralización',
      tipo: 'informes',
      anio: '2023',
      descripcion: 'Estado del proceso de descentralización del Ecuador e informes de capacidad operativa de los GAD.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2023/12/informe-descentralizacion-2023.pdf'
    },
    // Más resoluciones para la vista completa
    {
      id: 'resolucion-001-2023',
      nombre: 'Resolución Nro. 001-CNC-2023',
      tipo: 'resoluciones',
      anio: '2023',
      descripcion: 'Actualización de modelos de gestión para competencia de tránsito y transporte.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2023/01/Resolucion-No.-001-CNC-2023.pdf'
    },
    {
      id: 'resolucion-002-2023',
      nombre: 'Resolución Nro. 002-CNC-2023',
      tipo: 'resoluciones',
      anio: '2023',
      descripcion: 'Regulación para el ejercicio de la competencia de gestión de la cooperación internacional.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2023/03/Resolucion-No.-002-CNC-2023.pdf'
    },
    {
      id: 'resolucion-003-2022',
      nombre: 'Resolución Nro. 003-CNC-2022',
      tipo: 'resoluciones',
      anio: '2022',
      descripcion: 'Regulación para la gestión descentralizada de riego y drenaje.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2022/06/Resolucion-No.-003-CNC-2022.pdf'
    },
    {
      id: 'resolucion-004-2022',
      nombre: 'Resolución Nro. 004-CNC-2022',
      tipo: 'resoluciones',
      anio: '2022',
      descripcion: 'Fortalecimiento del sistema nacional de competencias en gobiernos parroquiales.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2022/09/Resolucion-No.-004-CNC-2022.pdf'
    },
    {
      id: 'resolucion-005-2021',
      nombre: 'Resolución Nro. 005-CNC-2021',
      tipo: 'resoluciones',
      anio: '2021',
      descripcion: 'Regulación para gestión descentralizada de servicios públicos de agua potable.',
      url: 'http://www.competencias.gob.ec/wp-content/uploads/2021/11/Resolucion-No.-005-CNC-2021.pdf'
    }
  ];

  // Repositorios
  repositorios: any = {
    'resoluciones': {
      titulo: 'Repositorio de Resoluciones CNC',
      descripcion: 'Acceda a todas las resoluciones emitidas por el Consejo Nacional de Competencias.',
      url: 'http://www.competencias.gob.ec/resoluciones/'
    },
    'informes': {
      titulo: 'Informes de Capacidad Operativa',
      descripcion: 'Consulte los informes técnicos de capacidad operativa de los GAD.',
      url: 'http://www.competencias.gob.ec/informes/'
    },
    'guias': {
      titulo: 'Guías Metodológicas',
      descripcion: 'Documentos técnicos y metodológicos para la implementación de competencias.',
      url: 'http://www.competencias.gob.ec/guias/'
    },
    'leyes': {
      titulo: 'Marco Legal',
      descripcion: 'Leyes, reglamentos y normativa legal vigente sobre el proceso de descentralización.',
      url: 'http://www.competencias.gob.ec/leyes/'
    }
  };

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    // private modalController: ModalController, // Removed unused injection causing error
    private sanitizer: DomSanitizer
  ) {
    addIcons({
      'search-outline': searchOutline,
      'search': search,
      'arrow-forward': arrowForward,
      'download-outline': downloadOutline,
      'eye-outline': eyeOutline,
      'arrow-up-outline': arrowUpOutline,
      'notifications-outline': notificationsOutline,
      'document-text-outline': documentTextOutline,
      'book-outline': bookOutline,
      'school-outline': schoolOutline,
      'briefcase-outline': briefcaseOutline,
      'filter-outline': filterOutline,
      'calendar-outline': calendarOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'close-outline': closeOutline,
      'document-outline': documentOutline,
      'list-outline': listOutline,
      'calculator-outline': calculatorOutline,
      'settings-outline': settingsOutline,
      'stats-chart-outline': statsChartOutline,
      'file-tray-full-outline': fileTrayFullOutline,
      'bar-chart-outline': barChartOutline,
      'library-outline': libraryOutline
    });
  }

  ngOnInit() {
    // Inicializar documentos filtrados con todos los documentos
    this.filteredDocumentos = [...this.documentos];
  }

  buscarNormativa() {
    // Ocultar cualquier resultado anterior
    this.mostrandoResultados = false;
    this.mostrandoTodas = false;

    // Filtrar documentos según los criterios de búsqueda
    this.filteredDocumentos = this.documentos.filter(doc => {
      // Filtrar por término de búsqueda
      const matchesSearchTerm = this.searchTerm.trim() === '' ||
        doc.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtrar por tipo
      const matchesTipo = this.filtroTipo === 'todos' || doc.tipo === this.filtroTipo;

      // Filtrar por año
      const matchesAnio = this.filtroAnio === 'todos' ||
        (this.filtroAnio === 'anteriores' ? parseInt(doc.anio) < 2019 : doc.anio === this.filtroAnio);

      return matchesSearchTerm && matchesTipo && matchesAnio;
    });

    if (this.filteredDocumentos.length === 0) {
      this.presentAlert('Sin resultados', 'No se encontraron documentos que coincidan con los criterios de búsqueda.');
    } else {
      // Mostrar los resultados directamente en la interfaz
      this.resultadosTitulo = 'Resultados de búsqueda';
      this.mostrandoResultados = true;

      // Notificar al usuario sobre los resultados encontrados
      this.presentToast(`Se encontraron ${this.filteredDocumentos.length} documentos`);

      // Desplazar la vista a los resultados
      setTimeout(() => {
        const resultadosElement = document.getElementById('resultados-busqueda');
        if (resultadosElement) {
          resultadosElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  verDocumento(id: string) {
    // Encontrar el documento en la lista
    const documento = this.documentos.find(doc => doc.id === id);

    if (documento) {
      // Abrir el documento en el navegador
      window.open(documento.url, '_system');
      this.presentToast(`Abriendo "${documento.nombre}" (${documento.anio})`);
    } else {
      this.presentToast(`Error: No se pudo encontrar el documento solicitado.`);
    }
  }

  verTodasResoluciones() {
    // Ocultar cualquier resultado anterior de búsqueda
    this.mostrandoResultados = false;

    // Filtrar solo documentos de tipo resoluciones
    this.filteredDocumentos = this.documentos.filter(doc => doc.tipo === 'resoluciones');

    if (this.filteredDocumentos.length > 0) {
      this.resultadosTitulo = 'Resoluciones del CNC';
      this.mostrandoTodas = true;
      this.mostrandoResultados = true;

      // Desplazar la vista a los resultados
      setTimeout(() => {
        const resultadosElement = document.getElementById('resultados-busqueda');
        if (resultadosElement) {
          resultadosElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      this.presentAlert('Resoluciones del CNC', 'No se encontraron resoluciones disponibles.');
    }
  }

  verRepositorio(tipo: string) {
    if (this.repositorios[tipo]) {
      const repositorio = this.repositorios[tipo];
      window.open(repositorio.url, '_system');
      this.presentToast(`Accediendo al repositorio: ${repositorio.titulo}`);
    } else {
      this.presentAlert('Error', 'No se pudo acceder al repositorio solicitado.');
    }
  }

  validarEmail(): boolean {
    if (!this.suscripcionEmail) return false;

    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(this.suscripcionEmail);
  }

  async suscribirse() {
    if (!this.validarEmail()) {
      this.presentAlert('Error', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    // Simular proceso de suscripción exitoso
    await this.presentToast(`Te has suscrito correctamente con el correo: ${this.suscripcionEmail}`);
    this.suscripcionEmail = '';
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: 'primary',
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  volverArriba() {
    // Ocultar los resultados y volver al formulario de búsqueda
    this.mostrandoResultados = false;
    this.mostrandoTodas = false;

    // Limpiar los filtros
    this.searchTerm = '';
    this.filtroTipo = 'todos';
    this.filtroAnio = 'todos';

    // Desplazarse al inicio de la página
    document.querySelector('ion-content')?.scrollToTop(500);
  }

  obtenerTipoBadge(tipo: string): string {
    switch (tipo) {
      case 'constitucion': return 'Fundamental';
      case 'leyes': return 'Ley Orgánica';
      case 'resoluciones': return 'Resolución';
      case 'guias': return 'Guía';
      case 'informes': return 'Informe';
      case 'acuerdos': return 'Acuerdo';
      default: return tipo;
    }
  }
}
