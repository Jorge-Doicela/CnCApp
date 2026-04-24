import { Component, signal, inject, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, IonLabel,
  IonInput, IonButton, LoadingController, ToastController, IonSpinner,
  IonSelect, IonSelectOption, IonCheckbox, AlertController,
  IonModal, IonRadioGroup, IonRadio, IonItem
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cardOutline, lockClosedOutline, personAddOutline, mailOutline,
  callOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline,
  closeCircleOutline, arrowBack, personOutline, mapOutline, locationOutline,
  maleFemaleOutline, peopleCircleOutline, calendarOutline, briefcaseOutline,
  flagOutline, arrowForwardOutline, arrowBackOutline, shieldCheckmarkOutline, refreshOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { RegisterStateService } from './register.state';
import { RouterModule } from '@angular/router';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { Provincia } from 'src/app/shared/models/provincia.model';
import { Canton } from 'src/app/shared/models/canton.model';
import { Genero } from 'src/app/shared/models/genero.model';
import { Etnia } from 'src/app/shared/models/etnia.model';
import { TipoParticipante } from 'src/app/shared/models/tipo-participante.model';
import { TipoParticipanteEnum, NivelGobiernoEnum } from 'src/app/shared/constants/enums';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent, IonIcon, IonLabel,
    IonInput, IonButton, IonSpinner,
    IonSelect, IonSelectOption, IonCheckbox,
    IonModal, IonRadioGroup, IonRadio, IonItem
  ]
})
export class RegisterPage {
  TipoParticipanteEnum = TipoParticipanteEnum;
  NivelGobiernoEnum = NivelGobiernoEnum;
  // Expose state signals
  step = this.state.step;
  userData = this.state.userData;
  personalData = this.state.personalData;
  laborData = this.state.laborData;
  termsData = this.state.termsData;

  // Inject AuthService
  private authService = inject(AuthService);
  private catalogoService = inject(CatalogoService);
  private cdr = inject(ChangeDetectorRef);

  // Catalogo data
  provincias = signal<Provincia[]>([]);
  cantones = signal<Canton[]>([]);
  filteredCantones = signal<Canton[]>([]);
  generos = signal<Genero[]>([]);
  etnias = signal<Etnia[]>([]);
  nacionalidades = signal<any[]>([]);
  tiposParticipante = signal<TipoParticipante[]>([]);
  tiposInstitucion = signal<any[]>([]);

  // Labor Specific Catalogs
  cargos = signal<any[]>([]);
  entidades = signal<any[]>([]); // "Nivel de gobierno u otro"
  mancomunidades = signal<any[]>([]);
  regimenesEspeciales = signal<any[]>([]);
  competencias = signal<any[]>([]);
  gradosOcupacionales = signal<any[]>([]);
  instituciones = signal<any[]>([]);
  educacionBasica = signal<any[]>([]);
  gadParroquias = signal<any[]>([]);

  opcionesInstitucionCombinadas = computed(() => {
    const labor = this.laborData();
    const resIds = this.state.resolvedIds();
    const selectedTipoId = labor.institucion?.institucionNivelGobiernoId;
    
    if (!selectedTipoId) return [];

    // Buscar si el tipo seleccionado es "EDUCACIÓN GENERAL BÁSICA"
    const tipoSelected = this.tiposInstitucion().find((e: any) => e.id === selectedTipoId);
    const esEducacion = tipoSelected?.nombre?.toUpperCase().includes('EDUCACIÓN');
    const esMancomunidad = tipoSelected?.nombre?.toUpperCase().includes('MANCOMUNIDADES');
    const esRegimenEspecial = tipoSelected?.nombre?.toUpperCase().includes('RÉGIMEN ESPECIAL');

    // Determinar si el nivel seleccionado es MUNICIPAL (por ID o por nombre)
    const selectedEntidad = this.entidadesGads().find((e: any) => e.id === selectedTipoId);
    const esMunicipal = (selectedEntidad?.nombre || '').toUpperCase().includes('MUNICIPAL') || 
                       selectedTipoId === resIds.nivelMunicipal;

    // Si el tipo seleccionado es "MUNICIPAL", usar la lista autorizada
    if (esMunicipal) {
      return this.munisAutorizados.map(name => ({ value: `i:${name}`, label: name }));
    }

    if (esEducacion) {
      return (this.educacionBasica() || []).map((e: any) => ({ value: `e:${e.id}`, label: e.nombre }));
    }
    
    if (esMancomunidad) {
      return (this.mancomunidades() || []).map((m: any) => ({ value: `m:${m.id}`, label: m.nombre }));
    }

    if (esRegimenEspecial) {
      return (this.regimenesEspeciales() || []).map((r: any) => ({ value: `r:${r.id}`, label: r.nombre }));
    }

    // Para el resto, filtrar instituciones_sistema por tipoInstitucionId
    let filtered = (this.instituciones() || []).filter((i: any) => i.tipoInstitucionId == selectedTipoId);

    // Apply Jurisdiction filters if present
    const provId = this.laborProvinciaId();
    const cantId = this.laborCantonId();
    if (provId) {
      filtered = filtered.filter((i: any) => i.id_provincia === provId);
    }
    if (cantId) {
      filtered = filtered.filter((i: any) => i.id_canton === cantId);
    }

    return filtered
      .map((i: any) => {
        const prov = this.provincias().find(p => p.id === i.id_provincia);
        const prefix = prov ? `${prov.nombre.toUpperCase()} / ` : '';
        return { value: `i:${i.id}`, label: `${prefix}${i.nombre.toUpperCase()}` };
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  });

  opcionesMunicipioCombinadas = computed(() => {
    const resIds = this.state.resolvedIds();
    return this.munisAutorizados.map(name => ({ value: name, label: name }));
  });

  entidadesGads = computed(() => {
    const todos = this.tiposInstitucion() || [];
    
    return todos
      .filter((e: any) => {
        const name = (e.nombre || '').toUpperCase();
        return name.includes('MUNICIPAL') || 
               name.includes('PARROQUIAL') || 
               name.includes('PROVINCIAL') || 
               name.includes('MANCOMU') || 
               name.includes('OTRO') ||
               name.includes('OTRA');
      })
      .map((e: any) => {
        const name = (e.nombre || '').toUpperCase();
        let label = e.nombre;
        if (name.includes('MUNICIPAL')) label = 'Municipal';
        else if (name.includes('PARROQUIAL')) label = 'Parroquial Rural';
        else if (name.includes('PROVINCIAL')) label = 'Provincial';
        else if (name.includes('MANCOMU')) label = 'Mancomunidad y Consorcios';
        else if (name.includes('OTRO') || name.includes('OTRA')) label = 'OTRO';
        
        return { ...e, nombre: label };
      })
      .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre, 'es'));
  });

  munisAutorizados = [
    "AZUAY / NABON", "AZUAY / PUCARA", "AZUAY / SANTA ISABEL", "AZUAY / CHORDELEG",
    "AZUAY / SAN FERNANDO", "AZUAY / OÑA", "AZUAY / GIRON", "AZUAY / GUALACEO",
    "AZUAY / CUENCA", "AZUAY / EL PAN", "AZUAY / PAUTE", "AZUAY / SEVILLA DE ORO",
    "AZUAY / GUACHAPALA", "AZUAY / CAMILO PONCE ENRIQUEZ", "AZUAY / SIGSIG",
    "BOLIVAR / SAN MIGUEL", "BOLIVAR / GUARANDA", "BOLIVAR / ECHEANDIA",
    "BOLIVAR / LAS NAVES", "BOLIVAR / CALUMA", "BOLIVAR / CHILLANES",
    "BOLIVAR / SAN JOSE DE CHIMBO", "CAÑAR / AZOGUES", "CAÑAR / CAÑAR",
    "CAÑAR / DELEG", "CAÑAR / EL TAMBO", "CAÑAR / LA TRONCAL", "CAÑAR / BIBLIAN",
    "CAÑAR / SUSCAL", "CARCHI / SAN PEDRO DE HUACA", "CARCHI / TULCAN",
    "CARCHI / MIRA", "CARCHI / MONTUFAR", "CARCHI / ESPEJO", "CARCHI / LA MANA",
    "COTOPAXI / SALCEDO", "COTOPAXI / SIGCHOS", "COTOPAXI / PUJILI",
    "COTOPAXI / SAQUISILI", "COTOPAXI / PANGUA", "COTOPAXI / LA MANA",
    "COTOPAXI / LATACUNGA", "CHIMBORAZO / PALLATANGA", "CHIMBORAZO / ALAUSI",
    "CHIMBORAZO / CHUNCHI", "CHIMBORAZO / GUAMOTE", "CHIMBORAZO / CUMANDA",
    "CHIMBORAZO / CHAMBO", "CHIMBORAZO / GUANO", "CHIMBORAZO / RIOBAMBA",
    "CHIMBORAZO / PENIPE", "CHIMBORAZO / COLTA", "EL ORO / PORTOVELO",
    "EL ORO / CHILLA", "EL ORO / PIÑAS", "EL ORO / MARCABELI", "EL ORO / HUAQUILLAS",
    "EL ORO / ATAHUALPA", "EL ORO / EL GUABO", "EL ORO / ZARUMA", "EL ORO / MACHALA",
    "EL ORO / BALSAS", "EL ORO / SANTA ROSA", "EL ORO / PASAJE", "EL ORO / ARENILLAS",
    "EL ORO / LAS LAJAS", "ESMERALDAS / SAN LORENZO", "ESMERALDAS / QUININDE",
    "ESMERALDAS / ATACAMES", "ESMERALDAS / RIO VERDE", "ESMERALDAS / MUISNE",
    "ESMERALDAS / ELOY ALFARO", "ESMERALDAS / ESMERALDAS", "GUAYAS / BALAO",
    "GUAYAS / NARANJAL", "GUAYAS / SALITRE (URBINA JADO)", "GUAYAS / SAN JACINTO DE YAGUACHI",
    "GUAYAS / DAULE", "GUAYAS / ALFREDO BAQUERIZO MORENO", "GUAYAS / BALZAR",
    "GUAYAS / DURAN", "GUAYAS / MILAGRO", "GUAYAS / ISIDRO AYORA", "GUAYAS / COLIMES",
    "GUAYAS / NARANJITO", "GUAYAS / CORONEL MARCELINO MARIDUEÑA", "GUAYAS / EL TRIUNFO",
    "GUAYAS / EL EMPALME", "GUAYAS / PEDRO CARBO", "GUAYAS / NOBOL",
    "GUAYAS / LOMAS DE SARGENTILLO", "GUAYAS / PALESTINA", "GUAYAS / SIMON BOLIVAR",
    "GUAYAS / PLAYAS", "GUAYAS / SANTA LUCIA", "GUAYAS / GUAYAQUIL",
    "GUAYAS / SAMBORONDON", "GUAYAS / GENERAL ANTONIO ELIZALDE",
    "IMBABURA / SAN MIGUEL DE URCUQUI", "IMBABURA / COTACACHI", "IMBABURA / IBARRA",
    "IMBABURA / PIMAMPIRO", "IMBABURA / ANTONIO ANTE", "IMBABURA / OTAVALO",
    "LOJA / CELICA", "LOJA / MACARA", "LOJA / SOZORANGA", "LOJA / SARAGURO",
    "LOJA / OLMEDO", "LOJA / CALVAS", "LOJA / CATAMAYO", "LOJA / ESPINDOLA",
    "LOJA / CHAGUARPAMBA", "LOJA / PINDAL", "LOJA / LOJA", "LOJA / GONZANAMA",
    "LOJA / ZAPOTILLO", "LOJA / PUYANGO", "LOJA / QUILANGA", "LOJA / PALTAS",
    "LOS RIOS / PUEBLO VIEJO", "LOS RIOS / BABA", "LOS RIOS / BUENA FE",
    "LOS RIOS / BABAHOYO", "LOS RIOS / MONTALVO", "LOS RIOS / VINCES",
    "LOS RIOS / QUEVEDO", "LOS RIOS / URDANETA", "LOS RIOS / VENTANAS",
    "LOS RIOS / VALENCIA", "LOS RIOS / QUINSALOMA", "LOS RIOS / MOCACHE",
    "LOS RIOS / PALENQUE", "MANABI / PAJAN", "MANABI / SUCRE", "MANABI / EL CARMEN",
    "MANABI / JUNIN", "MANABI / SAN VICENTE", "MANABI / JARAMIJO",
    "MANABI / PEDERNALES", "MANABI / PUERTO LOPEZ", "MANABI / ROCAFUERTE",
    "MANABI / PICHINCHA", "MANABI / 24 DE MAYO", "MANABI / PORTOVIEJO",
    "MANABI / MONTECRISTI", "MANABI / BOLIVAR", "MANABI / JAMA", "MANABI / TOSAGUA",
    "MANABI / OLMEDO", "MANABI / SANTA ANA", "MANABI / CHONE", "MANABI / JIPIJAPA",
    "MANABI / FLAVIO ALFARO", "MANABI / MANTA", "MORONA SANTIAGO / HUAMBOYA",
    "MORONA SANTIAGO / MORONA", "MORONA SANTIAGO / SANTIAGO",
    "MORONA SANTIAGO / SAN JUAN BOSCO", "MORONA SANTIAGO / SUCUA",
    "MORONA SANTIAGO / TAISHA", "MORONA SANTIAGO / GUALAQUIZA",
    "MORONA SANTIAGO / TIWINTZA", "MORONA SANTIAGO / PABLO VI",
    "MORONA SANTIAGO / PALORA", "MORONA SANTIAGO / LIMON INDANZA",
    "MORONA SANTIAGO / LOGROÑO", "NAPO / ARCHIDONA", "NAPO / TENA",
    "NAPO / CARLOS JULIO AROSEMENA", "NAPO / QUIJOS", "NAPO / EL CHACO",
    "ORELLANA / AGUARICO", "ORELLANA / ORELLANA", "ORELLANA / LORETO",
    "ORELLANA / LA JOYA DE LOS SACHAS", "PASTAZA / ARAJUNO", "PASTAZA / MERA",
    "PASTAZA / SANTA CLARA", "PASTAZA / PASTAZA", "PICHINCHA / QUITO",
    "PICHINCHA / MEJIA", "PICHINCHA / RUMIÑAHUI", "PICHINCHA / SAN MIGUEL DE LOS BANCOS",
    "PICHINCHA / CAYAMBE", "PICHINCHA / PEDRO VICENTE MALDONADO",
    "PICHINCHA / PEDRO MONCAYO", "PICHINCHA / PUERTO QUITO", "SANTA ELENA / SALINAS",
    "SANTA ELENA / SANTA ELENA", "SANTA ELENA / LIBERTAD", "SANTO DOMINGO / LA CONCORDIA",
    "SANTO DOMINGO / SANTO DOMINGO DE LOS TSACHILAS", "SUCUMBIOS / CUYABENO",
    "SUCUMBIOS / SHUSHUFINDI", "SUCUMBIOS / PUTUMAYO", "SUCUMBIOS / CASCALES",
    "SUCUMBIOS / LAGO AGRIO", "SUCUMBIOS / SUCUMBIOS", "SUCUMBIOS / GONZALO PIZARRO",
    "TUNGURAHUA / CEVALLOS", "TUNGURAHUA / PATATE", "TUNGURAHUA / AMBATO",
    "TUNGURAHUA / QUERO", "TUNGURAHUA / SANTIAGO DE PILLARO", "TUNGURAHUA / BAÑOS",
    "TUNGURAHUA / TISALEO", "TUNGURAHUA / MOCHA", "TUNGURAHUA / SAN PEDRO DE PELILEO",
    "ZAMORA CHINCHIPE / ZAMORA", "ZAMORA CHINCHIPE / YACUAMBI",
    "ZAMORA CHINCHIPE / EL PANGUI", "ZAMORA CHINCHIPE / CENTINELA DEL CONDOR",
    "ZAMORA CHINCHIPE / YANTZAZA", "ZAMORA CHINCHIPE / PAQUISHA",
    "ZAMORA CHINCHIPE / PALANDA", "ZAMORA CHINCHIPE / CHINCHIPE",
    "ZAMORA CHINCHIPE / NANGARITZA", "ZONAS NO DELIMITADAS / MANGA DEL CURA",
    "ZONAS NO DELIMITADAS / LAS GOLONDRINAS", "ZONAS NO DELIMITADAS / EL PIEDRERO"
  ];

  // Dynamic GAD List based on selected level (for Autoridad and Funcionario)
  opcionesGAD = computed(() => {
    const labor = this.laborData();
    const tpid = labor.tipoParticipanteId;
    const resIds = this.state.resolvedIds();
    
    // Si no es Autoridad ni Funcionario, no aplica esta lógica
    if (tpid !== resIds.tipoAutoridad && tpid !== resIds.tipoFuncionario) return [];

    const nivelId = tpid === resIds.tipoAutoridad 
      ? labor.autoridad?.nivelgobierno 
      : labor.funcionarioGad?.nivelgobierno;

    if (!nivelId) return [];

    // Determinar si el nivel seleccionado es MUNICIPAL (por ID o por nombre)
    const selectedEntidad = this.entidadesGads().find((e: any) => e.id === nivelId);
    const esMunicipal = (selectedEntidad?.nombre || '').toUpperCase().includes('MUNICIPAL') || 
                       nivelId === resIds.nivelMunicipal;

    // Para nivel Municipal, usar la lista autorizada
    if (esMunicipal) {
      return this.munisAutorizados.map(name => ({ value: name, label: name }));
    }

    // Apply Jurisdiction filters for Territorial GADs
    const provId = this.laborProvinciaId();
    const cantId = this.laborCantonId();

    if (nivelId === resIds.nivelProvincial) {
      return (this.provincias() || []).map(p => ({ value: p.nombre, label: p.nombre }));
    }

    if (nivelId === resIds.nivelParroquial) {
      let parrs = (this.gadParroquias() || []);
      if (provId) parrs = parrs.filter((p: any) => p.id_provincia === provId);
      if (cantId) parrs = parrs.filter((p: any) => p.id_canton === cantId);
      return parrs.map((p: any) => {
        const prov = this.provincias().find(pr => pr.id === p.id_provincia);
        const prefix = prov ? `${prov.nombre.toUpperCase()} / ` : '';
        return { value: p.nombre, label: `${prefix}${p.nombre.toUpperCase()}` };
      }).sort((a, b) => a.label.localeCompare(b.label, 'es'));
    }

    if (nivelId === resIds.nivelMancomunidad) {
      const authorized = [
        'CONSORCIO DE MUNICIPIOS AMAZÓNICOS Y GALÁPAGOS - COMAGA',
        'CONSORCIOS CON-NOR',
        'JUNTA MANCOMUNADA DE PROTECCIÓN DE DERECHOS DE LA NIÑEZ Y ADOLESCENCIA',
        'MANCOMUNIDAD COSTA LIMPIA',
        'MANCOMUNIDAD DE GOBIERNOS AUTÓNOMOS DESCENTRALIZADOS MUNICIPALES DE LA PROVINCIA DE MORONA SANTIAGO - MAGAMS',
        'MANCOMUNIDAD DE LOS GOBIERNOS AUTÓNOMOS DESCENTRALIZADOS PROVINCIALES DEL NORTE DEL ECUADOR',
        'MANCOMUNIDAD DEL PUEBLO CAÑARI',
        'MANCOMUNIDAD DE MANABI',
        'MANCOMUNIDAD ESPECÍFICA PARA LA CONSTRUCCIÓN DEL CAMAL BICANTONAL FRIGORÍFICO DE FAENAMIENTO DE GANADO',
        'MANCOMUNIDAD GOBIERNOS AUTÓNOMOS DESCENTRALIZADOS PARROQUIALES DE LA CUENCA DEL LAGO SAN PABLO',
        'MANCOMUNIDAD LAS MELIPONAS',
        'MANCOMUNIDAD PARA LA GESTIÓN INTEGRAL DE RESIDUOS SÓLIDOS EN LA PROVINCIA DE IMBABURA',
        'MANCOMUNIDAD VALLE CUYES',
        'OTRA'
      ];
      return authorized.map(name => ({ value: name, label: name }));
    }
    if (nivelId === resIds.nivelRegimenEspecial) {
      return (this.regimenesEspeciales() || []).map(r => ({ value: r.nombre, label: r.nombre }));
    }

    // Default: try to filter by the entity level ID
    let filtered = (this.instituciones() || []).filter(i => i.tipoInstitucionId === nivelId);
    
    return filtered
        .map(i => ({ value: i.nombre, label: i.nombre }))
        .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  });

  labelGAD = computed(() => {
    return 'GAD *';
  });

  // Local UI state
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showPasswordConfirm = signal<boolean>(false);
  recaptchaWidgetId: number | null = null;

  // Labor Jurisdiction Filters
  laborProvinciaId = signal<number | null>(null);
  laborCantonId = signal<number | null>(null);
  laborFilteredCantones = computed(() => {
    const provId = this.laborProvinciaId();
    if (!provId) return [];
    return this.cantones().filter(c => c.Id_Provincia === provId);
  });

  cargosAutoridad = computed(() => {
    const all = this.cargos() || [];
    const whitelist = [
      'ALCALDE',
      'PREFECTO',
      'VICEPREFECTO',
      'VICEALCALDE',
      'CONCEJAL',
      'PRESIDENTE DE JUNTA PARROQUIAL',
      'VOCAL DE JUNTA PARROQUIAL'
    ];
    let filtered = all.filter(c => whitelist.includes(c.nombre.toUpperCase()));
    
    // Add "OTRO"
    return [...filtered.map(c => c.nombre), 'OTRO'].sort();
  });

  termsText = `
    <p><strong>CONVENIO DE RESPONSABILIDAD DE USO DE PLATAFORMA DEL CNC</strong></p>
    <p>Al utilizar este sistema, usted se compromete a proporcionar información veraz y verificable.</p>
    <p>El Consejo Nacional de Competencias (CNC) garantiza la protección de sus datos personales y su uso exclusivo para los fines de capacitación y fortalecimiento institucional descritos, en estricto apego a la Ley Orgánica de Protección de Datos Personales del Ecuador.</p>
    <p>1. Todo registro que contenga información adulterada será eliminado y reportado a las autoridades pertinentes.</p>
    <p>2. Las capacitaciones y certificaciones otorgadas de manera gratuita son intransferibles.</p>
    <p>Firma Electrónica: El usuario reconoce que las interacciones dentro del portal tienen valor probatorio para trámites internos y oficiales del CNC.</p>
  `;

  passwordStrength = signal<{ score: number; label: string; color: string }>({ score: 0, label: '', color: 'medium' });

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    public state: RegisterStateService
  ) {
    addIcons({
      cardOutline, lockClosedOutline, personAddOutline, mailOutline,
      callOutline, eyeOutline, eyeOffOutline, checkmarkCircleOutline,
      closeCircleOutline, arrowBack, personOutline, mapOutline, locationOutline,
      maleFemaleOutline, peopleCircleOutline, calendarOutline, briefcaseOutline,
      flagOutline, arrowForwardOutline, arrowBackOutline, shieldCheckmarkOutline, refreshOutline
    });
  }

  ngOnInit() {
    this.loadCatalogos();
  }

  ngAfterViewInit() {
    // this.initRecaptcha(); // --- DESACTIVADO PARA PRUEBAS LOCALES ---
  }

  initRecaptcha() {
    const checkGrecaptcha = setInterval(() => {
      if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
        clearInterval(checkGrecaptcha);
        try {
          this.recaptchaWidgetId = (window as any).grecaptcha.render('register-recaptcha-wrapper', {
            'sitekey': '6LeIFo8sAAAAANn2CU_a1H2DgyagspGvU3OTsfps',
            'theme': 'light'
          });
        } catch(e) { console.error('Recaptcha init err', e); }
      }
    }, 500);
  }

  async loadCatalogos() {
    try {
      const safe = (p: Promise<any>) => p.catch(e => { console.warn('Catalog load error:', e?.message); return []; });

      const [provinciasResp, cantonesResp, generosResp, etniasResp, tiposParticipanteResp, nacionalidadesResp, cargosResp, entidadesResp, regimenesEspecialesResp, mancomunidadesResp, competenciasResp, gradosOcupacionalesResp, institucionesResp, educacionBasicaResp, gadParroquiasResp, tiposInstitucionResp] = await Promise.all([
        safe(firstValueFrom(this.catalogoService.getItems('provincias'))),
        safe(firstValueFrom(this.catalogoService.getItems('cantones'))),
        safe(firstValueFrom(this.catalogoService.getItems('generos'))),
        safe(firstValueFrom(this.catalogoService.getItems('etnias'))),
        safe(firstValueFrom(this.catalogoService.getItems('tipos-participante'))),
        safe(firstValueFrom(this.catalogoService.getItems('nacionalidades'))),
        safe(firstValueFrom(this.catalogoService.getItems('public/cargos'))),
        safe(firstValueFrom(this.catalogoService.getItems('public/entidades'))),
        safe(firstValueFrom(this.catalogoService.getItems('public/regimenes-especiales'))),
        safe(firstValueFrom(this.catalogoService.getItems('public/mancomunidades'))),
        safe(firstValueFrom(this.catalogoService.getItems('public/competencias'))),
        safe(firstValueFrom(this.catalogoService.getItems('public/grados-ocupacionales'))),
        safe(firstValueFrom(this.catalogoService.getItems('public/instituciones'))),
        safe(firstValueFrom(this.catalogoService.getItems('public/educacion-basica'))),
        safe(firstValueFrom(this.catalogoService.getItems('public/gad-parroquias'))),
        safe(firstValueFrom(this.catalogoService.getItems('public/tipos-institucion')))
      ]);

      // Only active ones, sorted (Backend returns id, nombre, estado, etc.)
      const activeProvincias = (provinciasResp || [])
        .filter((p: any) => p.estado !== false) // backend may not return estado or return true
        .sort((a: any, b: any) => (a.nombre || '').localeCompare(b.nombre || ''));

      const activeCantones = (cantonesResp || [])
        .filter((c: any) => c.estado !== false)
        .sort((a: any, b: any) => (a.nombre || '').localeCompare(b.nombre || ''));

      this.provincias.set(activeProvincias);
      this.cantones.set(activeCantones);
      this.generos.set(generosResp || []);
      this.etnias.set(etniasResp || []);
      this.nacionalidades.set(nacionalidadesResp || []);
      this.tiposParticipante.set(tiposParticipanteResp || []);
      this.cargos.set(cargosResp || []);
      const preferredOrder = [
        'PROVINCIAL',
        'MUNICIPAL',
        'PARROQUIAL RURAL',
        'GREMIOS',
        'GOBIERNO CENTRAL',
        'OTRAS INSTITUCIONES DEL ESTADO',
        'COOPERANTES',
        'ACADEMIA',
        'EDUCACIÓN GENERAL BÁSICA Y BACHILLERATO',
        'CIUDADANÍA',
        'MANCOMUNIDADES Y CONSORCIOS',
        'RÉGIMEN ESPECIAL'
      ];

      const sortedEntidades = (entidadesResp || []).sort((a: any, b: any) => {
        const indexA = preferredOrder.indexOf(a.nombre_entidad || a.nombre);
        const indexB = preferredOrder.indexOf(b.nombre_entidad || b.nombre);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return (a.nombre_entidad || a.nombre || '').localeCompare(b.nombre_entidad || b.nombre || '');
      });

      this.entidades.set(sortedEntidades);
      this.regimenesEspeciales.set(regimenesEspecialesResp || []);
      this.mancomunidades.set(mancomunidadesResp || []);
      this.competencias.set(competenciasResp || []);
      this.gradosOcupacionales.set(gradosOcupacionalesResp || []);
      this.instituciones.set(institucionesResp || []);
      this.educacionBasica.set(educacionBasicaResp || []);
      this.gadParroquias.set(gadParroquiasResp || []);
      this.tiposInstitucion.set(tiposInstitucionResp || []);

      // Resolve Dynamic IDs
      const findIdByCodigo = (list: any[], codigo: string, fallback: number) => {
        const match = list.find((i: any) => i.codigo === codigo);
        return match ? match.id : fallback;
      };

      const findIdByNombre = (list: any[], nombre: string, fallback: number) => {
        const match = list.find((i: any) => 
          (i.nombre || '').toUpperCase() === nombre.toUpperCase() || 
          (i.nombre_entidad || '').toUpperCase() === nombre.toUpperCase()
        );
        return match ? match.id : fallback;
      };

      const newResolvedIds = {
        tipoAutoridad: findIdByCodigo(tiposParticipanteResp, 'AUTORIDAD', TipoParticipanteEnum.AUTORIDAD),
        tipoCiudadano: findIdByCodigo(tiposParticipanteResp, 'CIUDADANO', TipoParticipanteEnum.CIUDADANO),
        tipoFuncionario: findIdByCodigo(tiposParticipanteResp, 'FUNCIONARIO_GAD', TipoParticipanteEnum.FUNCIONARIO_GAD),
        tipoInstitucion: findIdByCodigo(tiposParticipanteResp, 'INSTITUCION', TipoParticipanteEnum.INSTITUCION),
        nivelProvincial: findIdByCodigo(entidadesResp, 'NIVEL_PROVINCIAL', findIdByNombre(entidadesResp, 'Provincial', NivelGobiernoEnum.PROVINCIAL)),
        nivelMunicipal: findIdByCodigo(entidadesResp, 'NIVEL_MUNICIPAL', findIdByNombre(entidadesResp, 'Municipal', NivelGobiernoEnum.MUNICIPAL)),
        nivelParroquial: findIdByCodigo(entidadesResp, 'NIVEL_PARROQUIAL', findIdByNombre(entidadesResp, 'Parroquial', NivelGobiernoEnum.PARROQUIAL)),
        nivelMancomunidad: findIdByCodigo(entidadesResp, 'MANCOMUNIDADES', findIdByNombre(entidadesResp, 'Mancomunidad', NivelGobiernoEnum.MANCOMUNIDADES)),
        nivelRegimenEspecial: findIdByCodigo(entidadesResp, 'REGIMEN_ESPECIAL', findIdByNombre(entidadesResp, 'Regimen Especial', NivelGobiernoEnum.REGIMEN_ESPECIAL)),
      };

      this.state.setResolvedIds(newResolvedIds);

      // If reloading from session and we already had a provinciaId, restore the filtered cantones list immediately.
      const currentProv = this.userData().provinciaId;
      if (currentProv) {
        this.filteredCantones.set(activeCantones.filter((c: any) => Number(c.provinciaId) === Number(currentProv)));
      }

      this.cdr.detectChanges();
    } catch (e) {
      console.error('Error loading catalogues', e);
      this.presentToast('Error al cargar datos del formulario', 'danger');
      this.cdr.detectChanges();
    }
  }

  updateInstitucionTipo(tipoId: number) {
    this.state.updateLaborData({
      institucionNivelGobiernoId: tipoId,
      institucionId: undefined
    });
  }

  onProvinciaChange(event: any) {
    const provId = event.detail.value;
    this.state.updateUserData({ provinciaId: provId, cantonId: undefined });

    // Filter cantons by selected province
    if (provId) {
      const filtered = this.cantones().filter((c: any) => c.provinciaId === provId);
      this.filteredCantones.set(filtered);
    } else {
      this.filteredCantones.set([]);
    }
  }

  // --- Navigation ---

  async next() {
    const currentStep = this.step();

    if (currentStep === 1) {
      this.state.nextStep();
    } else if (currentStep === 2) {
      if (this.validateStep2()) this.state.nextStep();
    } else if (currentStep === 3) {
      if (this.validateStep3()) this.state.nextStep();
    } else if (currentStep === 4) {
      if (this.validateStep4()) this.state.nextStep();
    } else if (currentStep === 5) {
      await this.registerUser();
    }
  }

  prev() {
    this.state.prevStep();
  }

  handleHeaderBack() {
    if (this.step() > 1) {
      this.prev();
    } else {
      this.router.navigate(['/home']);
    }
  }

  // --- Validation Helpers ---

  validateStep2(): boolean {
    const data = this.userData();

    // Validar Cédula Ecuatoriana
    if (!this.validarCedula(data.ci)) {
      this.presentToast('Cédula inválida. Verifique el número.', 'warning');
      return false;
    }

    if (!data.email || !data.email.includes('@')) {
      this.presentToast('Email inválido', 'warning');
      return false;
    }
    if (!data.password || data.password.length < 8) {
      this.presentToast('Contraseña inválida (min 8 caracteres)', 'warning');
      return false;
    }
    if (data.password !== data.passwordConfirm) {
      this.presentToast('Las contraseñas no coinciden', 'warning');
      return false;
    }
    if (!data.provinciaId) {
      this.presentToast('Debe seleccionar una provincia', 'warning');
      return false;
    }
    if (!data.cantonId) {
      this.presentToast('Debe seleccionar un cantón', 'warning');
      return false;
    }
    return true;
  }

  // Algoritmo de validación de Cédula Ecuatoriana
  // Algoritmo de validación de Documento de Identidad (Universal)
  validarCedula(cedula: string): boolean {
    if (!cedula) return false;
    // Permitimos cualquier documento entre 5 y 20 caracteres para soportar pasaportes extranjeros
    return cedula.length >= 5 && cedula.length <= 20;
  }

  validateStep3(): boolean {
    const data = this.personalData();
    if (!data.primerNombre || !data.primerApellido) {
      this.presentToast('Ingrese sus nombres y apellidos', 'warning');
      return false;
    }
    if (!data.generoId || !data.etniaId) {
      this.presentToast('Seleccione su género y etnia', 'warning');
      return false;
    }
    if (!data.nacionalidadId) {
      this.presentToast('Seleccione su nacionalidad', 'warning');
      return false;
    }
    if (!data.celular || data.celular.length < 10) {
      this.presentToast('Ingrese un número de celular válido de 10 dígitos', 'warning');
      return false;
    }
    if (!data.fechaNacimiento) {
      this.presentToast('Ingrese su fecha de nacimiento', 'warning');
      return false;
    }
    return true;
  }

  validateStep4(): boolean {
    const data = this.laborData();
    const resIds = this.state.resolvedIds();

    if (data.tipoParticipanteId === undefined) {
      this.presentToast('Seleccione un tipo de participante', 'warning');
      return false;
    }

    if (data.tipoParticipanteId === resIds.tipoAutoridad) { // Autoridad
      if (!data.autoridad?.cargo || !data.autoridad?.nivelgobierno || !data.autoridad?.gadAutoridad) {
        this.presentToast('Complete todos los campos para Autoridad', 'warning');
        return false;
      }
    } else if (data.tipoParticipanteId === resIds.tipoFuncionario) { // Funcionario
      if (!data.funcionarioGad?.cargo || !data.funcionarioGad?.nivelgobierno || !data.funcionarioGad?.gadFuncionarioGad || !data.funcionarioGad?.competencias || data.funcionarioGad.competencias.length === 0) {
        this.presentToast('Complete todos los campos para Funcionario GAD, incluyendo competencias', 'warning');
        return false;
      }
    } else if (data.tipoParticipanteId === resIds.tipoInstitucion) { // Institucion
      if (!data.institucion?.institucion || !data.institucion?.gradoOcupacional || !data.institucion?.cargo) {
        this.presentToast('Complete todos los campos para Institución (institución, grado ocupacional y cargo)', 'warning');
        return false;
      }
    }

    return true;
  }

  // --- Actions ---

  async registerUser() {
    if (!this.termsData().termsAccepted) {
      this.presentToast('Debe aceptar los términos y condiciones', 'warning');
      return;
    }

    /* 
    let recaptchaToken = '';
    if (this.recaptchaWidgetId !== null) {
       recaptchaToken = (window as any).grecaptcha?.getResponse(this.recaptchaWidgetId);
    } else {
       recaptchaToken = (window as any).grecaptcha?.getResponse();
    }

    if (!recaptchaToken) {
      this.presentToast('Por favor, verifique que no es un robot', 'warning');
      return;
    }
    */
    const recaptchaToken = 'bypass_local'; // Bypass para desarrollo

    // Doble validación final por si hubo recarga de página (ej. se borró la contraseña)
    if (!this.validateStep2() || !this.validateStep3() || !this.validateStep4()) {
      this.presentToast('Faltan datos requeridos. Por favor revise los pasos anteriores.', 'danger');
      return;
    }

    const LOADING = await this.loadingController.create({ message: 'Registrando...', spinner: 'crescent' });
    await LOADING.present();
    this.isLoading.set(true);

    const fullData = {
      ...this.userData(),
      ...this.personalData(),
      ...this.laborData(),
      recaptchaToken
    };

    // Cast to any to bypass strict DTO match if interface isn't updated in frontend
    this.authService.register(fullData as any).subscribe({
      next: async (res) => {
        await LOADING.dismiss();
        this.isLoading.set(false);
        if (res.success) {
          const alert = await this.alertController.create({
             header: '¡Registro Exitoso!',
             message: 'Hemos enviado un enlace de confirmación a tu correo electrónico. Por favor, revísalo (y tu carpeta de Spam) para activar tu cuenta antes de iniciar sesión.',
             buttons: ['Entendido']
          });
          await alert.present();

          this.state.reset();
          try { 
            if (this.recaptchaWidgetId !== null) {
              (window as any).grecaptcha?.reset(this.recaptchaWidgetId); 
            } else {
              (window as any).grecaptcha?.reset();
            }
          } catch(e) {}
          this.router.navigate(['/login'], { replaceUrl: true });
        } else {
          try { 
            if (this.recaptchaWidgetId !== null) {
              (window as any).grecaptcha?.reset(this.recaptchaWidgetId); 
            } else {
              (window as any).grecaptcha?.reset();
            }
          } catch(e) {}
          this.presentToast(res.message || 'Error', 'danger');
        }
      },
      error: async (err) => {
        try { await LOADING.dismiss(); } catch(e){}
        this.isLoading.set(false);
        try { 
            if (this.recaptchaWidgetId !== null) {
              (window as any).grecaptcha?.reset(this.recaptchaWidgetId); 
            } else {
              (window as any).grecaptcha?.reset();
            }
        } catch(e) {}
        this.presentToast(err.error?.message || err.message || 'Error al conectar con el servidor', 'danger');
      }
    });
  }

  // --- UI Helpers ---

  updatePassword(event: any) {
    const val = event.target.value;
    this.state.updateUserData({ password: val });
    this.calculatePasswordStrength(val);
  }

  togglePasswordVisibility() { this.showPassword.set(!this.showPassword()); }
  togglePasswordConfirmVisibility() { this.showPasswordConfirm.set(!this.showPasswordConfirm()); }

  calculatePasswordStrength(password: string) {
    let score = 0;
    let label = '';
    let color = 'medium';

    if (password.length > 0) score += 1;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    score = Math.min(5, score);

    switch (score) {
      case 0: label = ''; color = 'medium'; break;
      case 1:
      case 2: label = 'Débil'; color = 'danger'; break;
      case 3: label = 'Media'; color = 'warning'; break;
      case 4: label = 'Fuerte'; color = 'success'; break;
      case 5: label = 'Muy Fuerte'; color = 'success'; break;
    }

    this.passwordStrength.set({ score, label, color });
  }

  async presentToast(msg: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: msg, duration: 2000, color, position: 'bottom'
    });
    await toast.present();
  }
}
