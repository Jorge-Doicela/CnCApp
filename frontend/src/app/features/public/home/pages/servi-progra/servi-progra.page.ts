import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonContent, IonSegment, IonSegmentButton,
  IonLabel, IonSearchbar, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonGrid, IonRow,
  IonCol, IonIcon, IonButton, IonList, IonItem,
  IonBadge, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline, fitnessOutline, analyticsOutline,
  shieldOutline, schoolOutline, buildOutline,
  swapHorizontalOutline, bookOutline, bulbOutline,
  mapOutline, calendarOutline, timeOutline,
  locationOutline, arrowForward, briefcaseOutline,
  laptopOutline, syncOutline, chevronUpOutline,
  chevronDownOutline, filterOutline, calendar
} from 'ionicons/icons';

@Component({
  selector: 'app-servi-progra',
  templateUrl: './servi-progra.page.html',
  styleUrls: ['./servi-progra.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton,
    IonTitle, IonContent, IonSegment, IonSegmentButton,
    IonLabel, IonSearchbar, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonGrid, IonRow,
    IonCol, IonIcon, IonButton, IonList, IonItem,
    IonBadge, IonSelect, IonSelectOption
  ]
})
export class ServiPrograPage implements OnInit {
  selectedSegment: string = 'servicios';
  filtroEvento: string = 'todos';
  showAllPrograms: boolean = false;
  filteredEventos: any[] = [];

  // Eventos
  eventos: any[] = [
    {
      id: 1,
      titulo: 'Taller de Gestión de Competencias Ambientales',
      fecha: '2025-05-15',
      mes: 'MAY',
      dia: '15',
      hora: '09:00 - 13:00',
      lugar: 'Quito - Sede CNC',
      dirigido: 'GAD Provinciales',
      tipo: 'taller',
      estado: 'programado',
      descripcion: 'Workshop enfocado en el desarrollo de capacidades para la gestión ambiental efectiva en los GAD Provinciales, incluye metodologías prácticas y casos de estudio.',
      agenda: [
        '09:00 - 09:30: Registro de participantes',
        '09:30 - 10:30: Marco normativo para la gestión ambiental',
        '10:30 - 11:00: Coffee break',
        '11:00 - 12:30: Implementación de planes de manejo ambiental',
        '12:30 - 13:00: Conclusiones y cierre'
      ],
      ponentes: [
        'Ing. María Gutiérrez - Dirección Técnica CNC',
        'Dr. Luis Molina - Especialista Ambiental',
        'Ing. Patricia Guevara - Ministerio del Ambiente'
      ]
    },
    {
      id: 2,
      titulo: 'Seminario: Modelos de Gestión para Tránsito y Transporte',
      fecha: '2025-06-07',
      mes: 'JUN',
      dia: '07',
      hora: '10:00 - 16:00',
      lugar: 'Guayaquil - Hotel Hilton Colón',
      dirigido: 'GAD Municipales',
      tipo: 'foro',
      estado: 'programado',
      descripcion: 'Seminario especializado sobre los modelos de gestión para la competencia de tránsito, transporte terrestre y seguridad vial. Se abordarán casos exitosos y buenas prácticas.',
      agenda: [
        '10:00 - 10:30: Inauguración',
        '10:30 - 12:00: Modelos de gestión diferenciados',
        '12:00 - 13:30: Almuerzo',
        '13:30 - 15:00: Experiencias exitosas en GAD',
        '15:00 - 16:00: Panel de expertos y cierre'
      ],
      ponentes: [
        'Ing. Roberto Andrade - Director Ejecutivo CNC',
        'Ing. Carlos López - ANT',
        'Arq. Diana Valdivieso - AME'
      ]
    },
    {
      id: 3,
      titulo: 'Curso: Formulación de Proyectos para GAD Parroquiales',
      fecha: '2025-07-18',
      mes: 'JUL',
      dia: '18',
      hora: '09:00 - 17:00',
      lugar: 'Virtual - Plataforma Zoom',
      dirigido: 'GAD Parroquiales Rurales',
      tipo: 'capacitacion',
      estado: 'programado',
      descripcion: 'Capacitación para fortalecer las capacidades de los GAD Parroquiales en el diseño, formulación y gestión de proyectos de desarrollo local sostenible.',
      agenda: [
        '09:00 - 10:30: Marco lógico para proyectos',
        '10:30 - 10:45: Receso',
        '10:45 - 12:30: Elaboración de presupuestos',
        '12:30 - 14:00: Receso almuerzo',
        '14:00 - 15:30: Indicadores y monitoreo',
        '15:30 - 17:00: Ejercicio práctico y evaluación'
      ],
      ponentes: [
        'Econ. Alejandra Rivas - Especialista en Proyectos',
        'Ing. Fernando Castro - CONAGOPARE',
        'Lcda. Mayra Paladines - SENPLADES'
      ]
    },
    {
      id: 4,
      titulo: 'Foro: Participación Ciudadana en la Gestión Local',
      fecha: '2025-04-05',
      mes: 'ABR',
      dia: '05',
      hora: '14:00 - 18:00',
      lugar: 'Cuenca - Universidad de Cuenca',
      dirigido: 'GAD Municipales y Parroquiales',
      tipo: 'foro',
      estado: 'expirado',
      descripcion: 'Espacio de diálogo sobre mecanismos efectivos para promover la participación ciudadana en los procesos de planificación y gestión local.',
      agenda: [
        '14:00 - 14:30: Inauguración',
        '14:30 - 16:00: Presentaciones de expertos',
        '16:00 - 16:30: Coffee break',
        '16:30 - 17:30: Panel de discusión',
        '17:30 - 18:00: Conclusiones y cierre'
      ],
      ponentes: [
        'Dr. Juan Peña - CPCCS',
        'Soc. Marta Juárez - Academia',
        'Sr. Ernesto Vega - Dirigente comunitario'
      ]
    },
    {
      id: 5,
      titulo: 'Workshop: Digitalización de Servicios Municipales',
      fecha: '2025-03-20',
      mes: 'MAR',
      dia: '20',
      hora: '08:30 - 16:30',
      lugar: 'Manta - Centro de Convenciones',
      dirigido: 'GAD Municipales',
      tipo: 'taller',
      estado: 'expirado',
      descripcion: 'Taller práctico sobre implementación de soluciones digitales para mejorar la gestión y prestación de servicios públicos municipales.',
      agenda: [
        '08:30 - 09:00: Registro',
        '09:00 - 11:00: Transformación digital en gobiernos locales',
        '11:00 - 11:30: Break',
        '11:30 - 13:00: Demostración de plataformas',
        '13:00 - 14:00: Almuerzo',
        '14:00 - 16:00: Ejercicios prácticos',
        '16:00 - 16:30: Conclusiones'
      ],
      ponentes: [
        'Ing. Sebastián Mora - MINTEL',
        'Ing. Carolina Díaz - Especialista TI',
        'Ing. José Luis Torres - Consultor'
      ]
    }
  ];

  // Servicios
  servicios: any[] = [
    {
      id: 'asistencia',
      titulo: 'Asistencia Técnica',
      icono: 'people-outline',
      descripcion: 'Apoyo técnico especializado para el ejercicio eficiente de competencias transferidas.',
      detalle: 'La asistencia técnica del CNC proporciona acompañamiento especializado a los Gobiernos Autónomos Descentralizados para fortalecer sus capacidades en el ejercicio de las competencias transferidas. Incluye capacitación personalizada, asesoramiento directo para la implementación de modelos de gestión, y soporte continuo para la resolución de problemáticas específicas en el territorio.',
      beneficios: [
        'Asesoramiento especializado para implementación de competencias',
        'Transferencia de conocimientos y buenas prácticas',
        'Desarrollo de capacidades institucionales',
        'Acompañamiento en el diseño de procesos',
        'Soporte para la elaboración de normativa local'
      ],
      requisitos: [
        'Solicitud formal dirigida a la Dirección Ejecutiva del CNC',
        'Identificación clara de las necesidades de asistencia',
        'Compromiso de participación del personal técnico del GAD',
        'Disponibilidad para seguimiento y evaluación'
      ]
    },
    {
      id: 'fortalecimiento',
      titulo: 'Fortalecimiento Institucional',
      icono: 'fitness-outline',
      descripcion: 'Desarrollo de capacidades institucionales para mejorar la gestión pública descentralizada.',
      detalle: 'El servicio de fortalecimiento institucional ofrece un conjunto de herramientas, metodologías y acciones orientadas a desarrollar y potenciar las capacidades institucionales de los GAD. Se enfoca en mejorar estructuras organizacionales, procesos, sistemas de gestión y capacidades del talento humano para una gestión pública eficiente.',
      beneficios: [
        'Diagnóstico de capacidades institucionales',
        'Diseño de modelos de gestión adaptados',
        'Mejora de procesos administrativos y operativos',
        'Formación de talento humano',
        'Herramientas para gestión por resultados'
      ],
      requisitos: [
        'Solicitud formal del GAD',
        'Participación en el proceso de diagnóstico institucional',
        'Designación de equipo técnico contraparte',
        'Facilitar información requerida para el proceso'
      ]
    },
    {
      id: 'monitoreo',
      titulo: 'Monitoreo y Evaluación',
      icono: 'analytics-outline',
      descripcion: 'Seguimiento al ejercicio de competencias y evaluación de capacidad operativa de los GAD.',
      detalle: 'El sistema de monitoreo y evaluación permite realizar un seguimiento continuo al ejercicio de las competencias transferidas y medir el nivel de gestión de los GAD. Proporciona información esencial para la toma de decisiones, la identificación de necesidades de fortalecimiento y la mejora continua de la gestión descentralizada.',
      beneficios: [
        'Evaluación objetiva de la gestión de competencias',
        'Identificación de fortalezas y áreas de mejora',
        'Datos actualizados para planificación estratégica',
        'Benchmarking entre GAD de similares características',
        'Retroalimentación para mejorar la gestión'
      ],
      metodologia: [
        'Definición de indicadores de desempeño',
        'Recolección periódica de información',
        'Análisis de resultados',
        'Elaboración de informes de capacidad operativa',
        'Socialización y retroalimentación'
      ]
    },
    {
      id: 'conflictos',
      titulo: 'Resolución de Conflictos',
      icono: 'shield-outline',
      descripcion: 'Mediación y resolución de conflictos de competencias entre diferentes niveles de gobierno.',
      detalle: 'El servicio de resolución de conflictos de competencias actúa como un mecanismo efectivo para dirimir controversias entre los diferentes niveles de gobierno respecto al ejercicio de sus competencias. El CNC, como ente técnico del proceso de descentralización, facilita espacios de diálogo y aplica procedimientos para la resolución consensuada de conflictos.',
      beneficios: [
        'Resolución técnica y objetiva de controversias',
        'Espacios de diálogo y concertación',
        'Clarificación de roles y responsabilidades',
        'Prevención de duplicidad de funciones',
        'Mejora de la coordinación intergubernamental'
      ],
      procedimiento: [
        'Recepción de la solicitud formal',
        'Análisis técnico y jurídico del caso',
        'Convocatoria a reuniones de conciliación',
        'Emisión de dictámenes técnicos',
        'Seguimiento a los acuerdos alcanzados'
      ]
    }
  ];

  // Programas
  programas: any[] = [
    {
      id: 'capacitacion',
      titulo: 'Programa de Capacitación',
      icono: 'school-outline',
      imagen: 'capacitacion.jpg',
      descripcion: 'Formación continua para autoridades y funcionarios de los GAD en temas relacionados con sus competencias y gestión pública.',
      detalle: 'El Programa de Capacitación ofrece formación continua y especializada a autoridades y funcionarios de los GAD para fortalecer sus conocimientos, habilidades y actitudes en el ejercicio efectivo de sus competencias. Se desarrolla a través de distintas modalidades y con una amplia oferta temática.',
      modalidades: ['Virtual', 'Presencial', 'Mixta'],
      areas: [
        'Gestión de competencias descentralizadas',
        'Administración pública',
        'Planificación territorial',
        'Finanzas públicas',
        'Gobernanza local'
      ],
      cursos: [
        {
          nombre: 'Gestión Descentralizada del Tránsito y Transporte',
          duracion: '40 horas',
          modalidad: 'Virtual',
          fechaInicio: 'Junio 2025'
        },
        {
          nombre: 'Elaboración de Ordenanzas para GAD',
          duracion: '30 horas',
          modalidad: 'Mixta',
          fechaInicio: 'Mayo 2025'
        },
        {
          nombre: 'Planificación y Ordenamiento Territorial',
          duracion: '60 horas',
          modalidad: 'Presencial',
          fechaInicio: 'Agosto 2025'
        }
      ]
    },
    {
      id: 'asistencia',
      titulo: 'Programa de Asistencia Técnica',
      icono: 'build-outline',
      imagen: 'asistencia.jpg',
      descripcion: 'Acompañamiento técnico especializado para el ejercicio efectivo de competencias y la implementación de proyectos.',
      detalle: 'El Programa de Asistencia Técnica proporciona acompañamiento especializado a los GAD para fortalecer sus capacidades institucionales en el ejercicio de competencias. Incluye diagnósticos, desarrollo de modelos de gestión, asesoría especializada y acompañamiento en la implementación.',
      componentes: [
        'Diagnóstico de capacidades institucionales',
        'Desarrollo de modelos de gestión',
        'Asesoría técnica especializada',
        'Implementación de sistemas y herramientas'
      ],
      metodologia: 'Metodología participativa que parte de un diagnóstico de necesidades específicas y diseña un plan de asistencia técnica a medida para cada GAD, con acompañamiento continuo y evaluación de resultados.',
      casos: [
        {
          titulo: 'Implementación del modelo de gestión de tránsito en municipios tipo B',
          resultados: 'Mejora del 40% en la capacidad operativa'
        },
        {
          titulo: 'Fortalecimiento de la gestión ambiental provincial',
          resultados: 'Desarrollo de planes de manejo ambiental en 12 provincias'
        }
      ]
    },
    {
      id: 'intercambio',
      titulo: 'Programa de Intercambio de Experiencias',
      icono: 'swap-horizontal-outline',
      imagen: 'intercambio.jpg',
      descripcion: 'Promoción del intercambio de buenas prácticas y experiencias exitosas entre gobiernos autónomos descentralizados.',
      detalle: 'El Programa promueve espacios de intercambio de conocimientos, experiencias y buenas prácticas entre los GAD, facilitando el aprendizaje horizontal y la replicabilidad de casos exitosos en la gestión descentralizada.',
      actividades: [
        'Encuentros territoriales',
        'Foros de buenas prácticas',
        'Visitas técnicas',
        'Documentación de experiencias exitosas'
      ],
      beneficios: [
        'Aprendizaje colaborativo entre pares',
        'Identificación de soluciones innovadoras',
        'Creación de redes de colaboración',
        'Optimización de recursos',
        'Replicabilidad de buenas prácticas'
      ],
      experiencias: [
        {
          gad: 'GAD Municipal de Cuenca',
          tema: 'Sistema integrado de transporte urbano',
          impacto: 'Reducción del 30% en tiempos de viaje'
        },
        {
          gad: 'GAD Provincial de Manabí',
          tema: 'Gestión de riego parcelario',
          impacto: 'Aumento del 45% en productividad agrícola'
        }
      ]
    },
    {
      id: 'formacion',
      titulo: 'Programa de Formación Especializada',
      icono: 'book-outline',
      imagen: 'formacion.jpg',
      descripcion: 'Formación especializada para funcionarios de GAD en áreas específicas de gestión descentralizada.',
      detalle: 'El Programa de Formación Especializada ofrece cursos y certificaciones de alto nivel para el personal técnico de los GAD, con enfoque en competencias específicas y desarrollo de habilidades avanzadas para la gestión pública local.',
      modalidades: ['Virtual', 'Presencial', 'Mixta'],
      areas: [
        'Ordenamiento territorial avanzado',
        'Gestión financiera pública',
        'Evaluación de proyectos',
        'Sistemas de información geográfica',
        'Gestión por resultados'
      ]
    },
    {
      id: 'innovacion',
      titulo: 'Programa de Innovación en Gobiernos Locales',
      icono: 'bulb-outline',
      imagen: 'innovacion.jpg',
      descripcion: 'Fomento de soluciones innovadoras para la gestión descentralizada y servicios públicos.',
      detalle: 'Este programa promueve la implementación de enfoques innovadores y soluciones creativas para los desafíos de la gestión local, incorporando nuevas tecnologías, metodologías participativas y modelos colaborativos.',
      componentes: [
        'Laboratorios de innovación pública',
        'Concursos de soluciones locales',
        'Ecosistemas de innovación territorial',
        'Implementación de gobierno abierto'
      ]
    }
  ];

  // Añadimos más programas para poder mostrar "Ver más"
  programasAdicionales: any[] = [
    {
      id: 'formacion',
      titulo: 'Programa de Formación Especializada',
      icono: 'book-outline',
      imagen: 'formacion.jpg',
      descripcion: 'Formación especializada para funcionarios de GAD en áreas específicas de gestión descentralizada.',
      detalle: 'El Programa de Formación Especializada ofrece cursos y certificaciones de alto nivel para el personal técnico de los GAD, con enfoque en competencias específicas y desarrollo de habilidades avanzadas para la gestión pública local.',
      modalidades: ['Virtual', 'Presencial', 'Mixta'],
      areas: [
        'Ordenamiento territorial avanzado',
        'Gestión financiera pública',
        'Evaluación de proyectos',
        'Sistemas de información geográfica',
        'Gestión por resultados'
      ]
    },
    {
      id: 'innovacion',
      titulo: 'Programa de Innovación en Gobiernos Locales',
      icono: 'bulb-outline',
      imagen: 'innovacion.jpg',
      descripcion: 'Fomento de soluciones innovadoras para la gestión descentralizada y servicios públicos.',
      detalle: 'Este programa promueve la implementación de enfoques innovadores y soluciones creativas para los desafíos de la gestión local, incorporando nuevas tecnologías, metodologías participativas y modelos colaborativos.',
      componentes: [
        'Laboratorios de innovación pública',
        'Concursos de soluciones locales',
        'Ecosistemas de innovación territorial',
        'Implementación de gobierno abierto'
      ]
    },
    {
      id: 'territorial',
      titulo: 'Programa de Desarrollo Territorial',
      icono: 'map-outline',
      imagen: 'territorial.jpg',
      descripcion: 'Apoyo a los GAD en la implementación de estrategias de desarrollo territorial sostenible.',
      detalle: 'El programa brinda herramientas y metodologías para diseñar, implementar y evaluar planes de desarrollo territorial que integren las dimensiones económica, social, ambiental y cultural.',
      componentes: [
        'Planificación estratégica territorial',
        'Implementación de sistemas de información territorial',
        'Articulación de actores locales',
        'Diseño de proyectos de desarrollo territorial'
      ]
    }
  ];

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private sanitizer: DomSanitizer
  ) {
    addIcons({
      'people-outline': peopleOutline,
      'fitness-outline': fitnessOutline,
      'analytics-outline': analyticsOutline,
      'shield-outline': shieldOutline,
      'school-outline': schoolOutline,
      'build-outline': buildOutline,
      'swap-horizontal-outline': swapHorizontalOutline,
      'book-outline': bookOutline,
      'bulb-outline': bulbOutline,
      'map-outline': mapOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'location-outline': locationOutline,
      'arrow-forward': arrowForward,
      'briefcase-outline': briefcaseOutline,
      'laptop-outline': laptopOutline,
      'sync-outline': syncOutline,
      'chevron-up-outline': chevronUpOutline,
      'chevron-down-outline': chevronDownOutline,
      'filter-outline': filterOutline,
      'calendar': calendar
    });
  }

  ngOnInit() {
    // Inicializar eventos filtrados
    this.filtrarEventos();
  }

  segmentChanged() {
    console.log('Segmento seleccionado:', this.selectedSegment);

    // Si cambiamos a la pestaña de eventos, actualizamos el filtro
    if (this.selectedSegment === 'eventos') {
      this.filtrarEventos();
    }
  }

  filtrarEventos() {
    // Aplicar filtro según selección
    if (this.filtroEvento === 'todos') {
      this.filteredEventos = [...this.eventos];
    } else {
      this.filteredEventos = this.eventos.filter(evento => evento.tipo === this.filtroEvento);
    }

    // Ordenar: primero los eventos programados, luego los expirados
    this.filteredEventos.sort((a, b) => {
      // Primero ordenar por estado (programado primero, expirado después)
      if (a.estado !== b.estado) {
        return a.estado === 'programado' ? -1 : 1;
      }
      // Luego ordenar por fecha
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });
  }

  async verDetalleServicio(id: string) {
    const servicio = this.servicios.find(s => s.id === id);

    if (!servicio) {
      this.presentToast('Servicio no encontrado');
      return;
    }

    // Crear un componente personalizado para evitar el escape de HTML
    const componentProps = {
      servicio: servicio,
      sanitizedHtml: this.sanitizer.bypassSecurityTrustHtml(this.createServiceDetailHTML(servicio))
    };

    const alert = await this.alertController.create({
      header: servicio.titulo,
      subHeader: 'Servicio del CNC',
      message: this.createServiceDetailHTML(servicio),
      cssClass: ['servicio-alert', 'custom-alert-with-html'],
      buttons: [
        {
          text: 'Solicitar',
          handler: () => {
            this.solicitarServicio(servicio.titulo);
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();

    // Una vez presentada la alerta, intentar hacer el innerHTML manualmente
    const alertElement = document.querySelector('.custom-alert-with-html .alert-message');
    if (alertElement) {
      alertElement.innerHTML = this.createServiceDetailHTML(servicio);
    }
  }

  // Función auxiliar para crear HTML para los detalles del servicio
  createServiceDetailHTML(servicio: any): string {
    return `
      <div class="servicio-detalle">
        <p>${servicio.detalle}</p>
        <h4>Beneficios:</h4>
        <ul>
          ${servicio.beneficios.map((b: string) => `<li>${b}</li>`).join('')}
        </ul>
        ${servicio.requisitos ? `
          <h4>Requisitos:</h4>
          <ul>
            ${servicio.requisitos.map((r: string) => `<li>${r}</li>`).join('')}
          </ul>
        ` : ''}
        ${servicio.metodologia ? `
          <h4>Metodología:</h4>
          <ul>
            ${servicio.metodologia.map((m: string) => `<li>${m}</li>`).join('')}
          </ul>
        ` : ''}
        ${servicio.procedimiento ? `
          <h4>Procedimiento:</h4>
          <ul>
            ${servicio.procedimiento.map((p: string) => `<li>${p}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `;
  }

  async verDetallePrograma(id: string) {
    // Buscar en ambos arrays de programas
    const programa = [...this.programas, ...this.programasAdicionales].find(p => p.id === id);

    if (!programa) {
      this.presentToast('Programa no encontrado');
      return;
    }

    const alert = await this.alertController.create({
      header: programa.titulo,
      subHeader: 'Programa del CNC',
      message: this.createProgramDetailHTML(programa),
      cssClass: ['programa-alert', 'custom-alert-with-html'],
      buttons: [
        {
          text: 'Participar',
          handler: () => {
            this.solicitarParticipacionPrograma(programa.titulo);
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();

    // Una vez presentada la alerta, intentar hacer el innerHTML manualmente
    const alertElement = document.querySelector('.custom-alert-with-html .alert-message');
    if (alertElement) {
      alertElement.innerHTML = this.createProgramDetailHTML(programa);
    }
  }

  // Función auxiliar para crear HTML para los detalles del programa
  createProgramDetailHTML(programa: any): string {
    return `
      <div class="programa-detalle">
        <p>${programa.detalle}</p>
        ${programa.modalidades ? `
          <h4>Modalidades:</h4>
          <p>${programa.modalidades.join(', ')}</p>
        ` : ''}
        ${programa.areas ? `
          <h4>Áreas temáticas:</h4>
          <ul>
            ${programa.areas.map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        ` : ''}
        ${programa.componentes ? `
          <h4>Componentes:</h4>
          <ul>
            ${programa.componentes.map((c: string) => `<li>${c}</li>`).join('')}
          </ul>
        ` : ''}
        ${programa.actividades ? `
          <h4>Actividades:</h4>
          <ul>
            ${programa.actividades.map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        ` : ''}
        ${programa.metodologia ? `
          <h4>Metodología:</h4>
          <p>${programa.metodologia}</p>
        ` : ''}
        ${programa.cursos ? `
          <h4>Cursos disponibles:</h4>
          <ul>
            ${programa.cursos.map((c: any) =>
      `<li><strong>${c.nombre}</strong> - ${c.duracion}, ${c.modalidad}, Inicio: ${c.fechaInicio}</li>`
    ).join('')}
          </ul>
        ` : ''}
      </div>
    `;
  }

  async verDetalleEvento(id: number) {
    const evento = this.eventos.find(e => e.id === id);

    if (!evento) {
      this.presentToast('Evento no encontrado');
      return;
    }

    const fechaEvento = new Date(evento.fecha);
    const hoy = new Date();
    const esExpirado = fechaEvento < hoy;

    const buttons = [
      {
        text: 'Cerrar',
        role: 'cancel'
      }
    ];

    if (!esExpirado) {
      buttons.unshift({
        text: 'Inscribirse',
        handler: () => {
          this.inscribirseEvento(evento.titulo);
        }
      } as any);
    }

    const alert = await this.alertController.create({
      header: evento.titulo,
      subHeader: evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1),
      message: this.createEventDetailHTML(evento, esExpirado),
      cssClass: ['evento-alert', 'custom-alert-with-html'],
      buttons: buttons
    });

    await alert.present();

    // Una vez presentada la alerta, intentar hacer el innerHTML manualmente
    const alertElement = document.querySelector('.custom-alert-with-html .alert-message');
    if (alertElement) {
      alertElement.innerHTML = this.createEventDetailHTML(evento, esExpirado);
    }
  }

  // Función auxiliar para crear HTML para los detalles del evento
  createEventDetailHTML(evento: any, esExpirado: boolean): string {
    return `
      <div class="evento-detalle">
        <p class="evento-estado ${esExpirado ? 'expirado' : 'activo'}">
          Estado: ${esExpirado ? 'Expirado' : 'Programado'}
        </p>
        <p>${evento.descripcion}</p>

        <div class="evento-info">
          <p><ion-icon name="calendar-outline"></ion-icon> <strong>Fecha:</strong> ${this.formatearFecha(evento.fecha)}</p>
          <p><ion-icon name="time-outline"></ion-icon> <strong>Hora:</strong> ${evento.hora}</p>
          <p><ion-icon name="location-outline"></ion-icon> <strong>Lugar:</strong> ${evento.lugar}</p>
          <p><ion-icon name="people-outline"></ion-icon> <strong>Dirigido a:</strong> ${evento.dirigido}</p>
        </div>

        <h4>Agenda:</h4>
        <ul>
          ${evento.agenda.map((a: string) => `<li>${a}</li>`).join('')}
        </ul>

        <h4>Ponentes:</h4>
        <ul>
          ${evento.ponentes.map((p: string) => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  formatearFecha(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  async solicitarServicio(servicio: string = '') {
    const alert = await this.alertController.create({
      header: 'Solicitud de Servicio',
      message: `Complete el formulario para solicitar ${servicio ? 'el servicio de ' + servicio : 'un servicio del CNC'}`,
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre completo',
          attributes: {
            required: 'true'
          }
        },
        {
          name: 'institucion',
          type: 'text',
          placeholder: 'Institución',
          attributes: {
            required: 'true'
          }
        },
        {
          name: 'cargo',
          type: 'text',
          placeholder: 'Cargo'
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico',
          attributes: {
            required: 'true'
          }
        },
        {
          name: 'telefono',
          type: 'tel',
          placeholder: 'Teléfono'
        },
        {
          name: 'servicio',
          type: 'text',
          placeholder: 'Servicio requerido',
          value: servicio
        },
        {
          name: 'descripcion',
          type: 'textarea',
          placeholder: 'Describa brevemente su requerimiento'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: (data) => {
            if (!data.nombre || !data.institucion || !data.email) {
              this.presentToast('Por favor complete los campos obligatorios');
              return false;
            }
            console.log('Solicitud enviada:', data);
            this.presentSuccessAlert('Su solicitud ha sido enviada con éxito. Un representante del CNC se pondrá en contacto con usted próximamente.');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async solicitarParticipacionPrograma(programa: string) {
    const alert = await this.alertController.create({
      header: 'Participación en Programa',
      message: `Complete el formulario para participar en el programa de ${programa}`,
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre completo',
          attributes: {
            required: 'true'
          }
        },
        {
          name: 'institucion',
          type: 'text',
          placeholder: 'Institución',
          attributes: {
            required: 'true'
          }
        },
        {
          name: 'cargo',
          type: 'text',
          placeholder: 'Cargo'
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico',
          attributes: {
            required: 'true'
          }
        },
        {
          name: 'telefono',
          type: 'tel',
          placeholder: 'Teléfono'
        },
        {
          name: 'motivo',
          type: 'textarea',
          placeholder: 'Motivo de interés en el programa'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: (data) => {
            if (!data.nombre || !data.institucion || !data.email) {
              this.presentToast('Por favor complete los campos obligatorios');
              return false;
            }
            console.log('Solicitud enviada:', data);
            this.presentSuccessAlert('Su solicitud de participación ha sido registrada. Recibirá información detallada sobre el programa en su correo electrónico.');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async inscribirseEvento(evento: string) {
    const alert = await this.alertController.create({
      header: 'Inscripción al Evento',
      message: `Complete el formulario para inscribirse en: ${evento}`,
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre completo',
          attributes: {
            required: 'true'
          }
        },
        {
          name: 'institucion',
          type: 'text',
          placeholder: 'Institución',
          attributes: {
            required: 'true'
          }
        },
        {
          name: 'cargo',
          type: 'text',
          placeholder: 'Cargo'
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico',
          attributes: {
            required: 'true'
          }
        },
        {
          name: 'telefono',
          type: 'tel',
          placeholder: 'Teléfono'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Inscribirse',
          handler: (data) => {
            if (!data.nombre || !data.institucion || !data.email) {
              this.presentToast('Por favor complete los campos obligatorios');
              return false;
            }
            console.log('Inscripción enviada:', data);
            this.presentSuccessAlert('Su inscripción ha sido registrada correctamente. Recibirá un correo de confirmación con los detalles del evento.');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async presentSuccessAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Operación Exitosa',
      message: message,
      buttons: ['Aceptar']
    });

    await alert.present();
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

  async verTodosEventos() {
    // Separar eventos por estado
    const hoy = new Date();
    const eventosExpirados = this.eventos
      .filter(e => new Date(e.fecha) < hoy)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const eventosFuturos = this.eventos
      .filter(e => new Date(e.fecha) >= hoy)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    const htmlContent = this.createAllEventsHTML(eventosFuturos, eventosExpirados);

    // Create the sanitized content
    const sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(htmlContent);

    const alert = await this.alertController.create({
      header: 'Calendario de Eventos',
      subHeader: 'Eventos programados y realizados',
      message: htmlContent,
      cssClass: ['eventos-calendario-alert', 'custom-alert-with-html'],
      buttons: ['Cerrar']
    });

    await alert.present();

    // Manually set inner HTML after alert is presented
    setTimeout(() => {
      const alertElement = document.querySelector('.eventos-calendario-alert .alert-message');
      if (alertElement) {
        alertElement.innerHTML = htmlContent;

        // Add event listeners after setting innerHTML
        const eventosItems = alertElement.querySelectorAll('.evento-item');
        eventosItems.forEach(item => {
          item.addEventListener('click', () => {
            const id = parseInt(item.getAttribute('data-id') || '0');
            alert.dismiss();
            setTimeout(() => {
              this.verDetalleEvento(id);
            }, 300);
          });
        });
      }
    }, 300);
  }

  // Función auxiliar para crear HTML para todos los eventos
  createAllEventsHTML(eventosFuturos: any[], eventosExpirados: any[]): string {
    let html = `<div class="todos-eventos">`;

    if (eventosFuturos.length > 0) {
      html += `
        <h4>Próximos Eventos</h4>
        <ul class="eventos-lista">
          ${eventosFuturos.map(e => `
            <li class="evento-item" data-id="${e.id}">
              <div class="evento-fecha">${e.mes} ${e.dia}</div>
              <div class="evento-info">
                <strong>${e.titulo}</strong><br>
                <small>${e.tipo.charAt(0).toUpperCase() + e.tipo.slice(1)} - ${e.lugar}</small>
              </div>
            </li>
          `).join('')}
        </ul>
      `;
    }

    if (eventosExpirados.length > 0) {
      html += `
        <h4>Eventos Anteriores</h4>
        <ul class="eventos-lista eventos-expirados">
          ${eventosExpirados.map(e => `
            <li class="evento-item" data-id="${e.id}">
              <div class="evento-fecha">${e.mes} ${e.dia}</div>
              <div class="evento-info">
                <strong>${e.titulo}</strong><br>
                <small>${e.tipo.charAt(0).toUpperCase() + e.tipo.slice(1)} - ${e.lugar}</small>
                <span class="badge-expirado">Expirado</span>
              </div>
            </li>
          `).join('')}
        </ul>
      `;
    }

    html += `</div>`;
    return html;
  }

  toggleShowAllPrograms() {
    this.showAllPrograms = !this.showAllPrograms;
  }
}
