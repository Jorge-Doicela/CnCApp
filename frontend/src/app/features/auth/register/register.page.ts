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
  cargosOriginal = signal<any[]>([]);
  cargos = computed(() => {
    const labor = this.laborData();
    const resIds = this.state.resolvedIds();
    const tpid = labor.tipoParticipanteId;
    
    if (tpid === resIds.tipoFuncionario) {
      return [
        { id: 101, nombre: 'Asesor(a)' },
        { id: 102, nombre: 'Director(a) Dirección/Dpto./Unidad' },
        { id: 103, nombre: 'Jefe Dpto./Unidad' },
        { id: 104, nombre: 'Técnico' },
        { id: 105, nombre: 'Otro' }
      ];
    }
    
    if (tpid === resIds.tipoInstitucion) {
      const listaInstitucion = [
        "Secretario(a) del Ministro(a)", "Abogado(a)", "Asistente de abogacía", "Asistente de comunicación social",
        "Comunicador social", "Analista de planificación", "Secretaria(o) ejecutiva(o) de coordinación",
        "Analista económico", "Administrador base de datos", "Analista de información",
        "Analista legal y monitoreo de inversión", "Analista de servicio al inversionista",
        "Analista de seguimiento y evaluación de políticas públicas", "Analista de diseño de políticas públicas",
        "Analista de fomento productivo", "Tesorero general", "Analista de compras públicas",
        "Analista de contabilidad", "Asistente financiero", "Contador general", "Analista de presupuesto",
        "Asistente de presupuesto", "Recepcionista", "Analista administrativo", "Analista de activos fijos",
        "Asistente administrativo", "Asistente de transportación", "Técnico de archivo",
        "Analista de atención al ciudadano", "Analista de talento humano", "Asistente de talento humano",
        "Analista de tecnologías de la información", "Asistente de tecnologías de la información", "Otro"
      ];
      return listaInstitucion.map((name, index) => ({ id: 400 + index, nombre: name }));
    }
    
    return this.cargosOriginal();
  });
  entidades = signal<any[]>([]); // "Nivel de gobierno u otro"
  mancomunidades = signal<any[]>([]);
  regimenesEspeciales = signal<any[]>([]);
  competenciasOriginal = signal<any[]>([]);
  competencias = computed(() => {
    // Lista autorizada proporcionada por el usuario
    const lista = [
      "Áridos y pétreos",
      "Cooperación Internacional",
      "Dragado",
      "Fomento de actividades productivas y agropecuarias",
      "Forestación y reforestación",
      "Fortalecimiento General",
      "Gestión ambiental",
      "Infraestructura física, equipamientos y espacios públicos",
      "Patrimonio",
      "Prevención, protección, socorro y extinción",
      "Protección integral de derechos",
      "Riego y drenaje",
      "Servicios públicos",
      "Tránsito, transporte terrestre y seguridad vial",
      "Vialidad"
    ];
    return lista.map((name, index) => ({ id: 200 + index, nombre: name }));
  });
  gradosOcupacionalesOriginal = signal<any[]>([]);
  gradosOcupacionales = computed(() => {
    const lista = [
      "Servidor Público de Servicios 1",
      "Servidor Público de Servicios 2",
      "Servidor Público de Apoyo 1",
      "Servidor Público de Apoyo 2",
      "Servidor Público de Apoyo 3",
      "Servidor Público de Apoyo 4",
      "Servidor Público 1",
      "Servidor Público 2",
      "Servidor Público 3",
      "Servidor Público 4",
      "Servidor Público 5",
      "Servidor Público 6",
      "Servidor Público 7",
      "Servidor Público 8",
      "Servidor Público 9",
      "Servidor Público 10",
      "Servidor Público 11",
      "Servidor Público 12",
      "Servidor Público 13",
      "Servidor Público 14",
      "Otro"
    ];
    return lista.map((name, index) => ({ id: 300 + index, nombre: name }));
  });
  instituciones = signal<any[]>([]);
  educacionBasica = signal<any[]>([]);
  gadParroquias = signal<any[]>([]);

  opcionesInstitucionCombinadas = computed(() => {
    const labor = this.laborData();
    const resIds = this.state.resolvedIds();
    const selectedTipoId = labor.institucion?.institucionNivelGobiernoId;
    
    // Si no hay nivel seleccionado, mostramos todas las instituciones del sistema por defecto
    if (!selectedTipoId) {
      return this.instisAutorizadas.map(name => ({ value: `i:${name}`, label: name }));
    }

    // Buscar si el tipo seleccionado es "EDUCACIÓN GENERAL BÁSICA"
    const tipoSelected = this.tiposInstitucion().find((e: any) => e.id === selectedTipoId);
    const esEducacion = tipoSelected?.nombre?.toUpperCase().includes('EDUCACIÓN');
    const esMancomunidad = tipoSelected?.nombre?.toUpperCase().includes('MANCOMUNIDADES');
    const esRegimenEspecial = tipoSelected?.nombre?.toUpperCase().includes('RÉGIMEN ESPECIAL');

    // Determinar si el nivel seleccionado es MUNICIPAL (por ID o por nombre)
    const selectedEntidad = this.entidadesGads().find((e: any) => e.id === selectedTipoId);
    const entidadNombre = (selectedEntidad?.nombre || '').toUpperCase();
    const esMunicipal = entidadNombre.includes('MUNICIPAL') || selectedTipoId === resIds.nivelMunicipal;
    const esOtro = entidadNombre.includes('OTRO') || entidadNombre.includes('OTRA');
    const esParroquial = entidadNombre.includes('PARROQUIAL') || selectedTipoId === resIds.nivelParroquial;

    // Si el tipo seleccionado es "MUNICIPAL", usar la lista autorizada
    if (esMunicipal) {
      return this.munisAutorizados.map(name => ({ value: `i:${name}`, label: name }));
    }

    // Si el tipo seleccionado es "PARROQUIAL RURAL", usar la lista autorizada
    if (esParroquial) {
      return this.parrsAutorizadas.map(name => ({ value: `p:${name}`, label: name }));
    }

    // Si el tipo seleccionado es "OTRO", usar la lista autorizada
    if (esOtro) {
      return this.parrsAutorizadas.map(name => ({ value: `o:${name}`, label: name }));
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

  parrsAutorizadas = [
    "AZUAY / SANTA ISABEL / SAN SALVADOR DE CAÑARIBAMBA", "AZUAY / CUENCA / SAYAUSI", "AZUAY / CUENCA / SIDCAY",
    "AZUAY / CUENCA / RICAURTE", "AZUAY / CUENCA / QUINGEO", "AZUAY / CUENCA / OCTAVIO CORDERO PALACIOS",
    "AZUAY / CUENCA / NULTI", "AZUAY / CUENCA / MOLLETURO", "AZUAY / CUENCA / LLACAO", "AZUAY / CUENCA / CUMBE",
    "AZUAY / CHORDELEG / LA UNION", "AZUAY / CUENCA / CHIQUINTAD", "AZUAY / CUENCA / CHAUCHA",
    "AZUAY / CUENCA / BAÑOS", "AZUAY / CHORDELEG / SAN MARTIN DE PUZHIO", "AZUAY / CHORDELEG / PRINCIPAL",
    "AZUAY / CHORDELEG / LUIS GALARZA ORELLANA", "AZUAY / CAMILO PONCE ENRIQUEZ / EL CARMEN DE PIJILI",
    "AZUAY / CUENCA / SININCAY", "AZUAY / CUENCA / TURI", "AZUAY / CUENCA / VALLE",
    "AZUAY / CUENCA / VICTORIA DEL PORTETE", "AZUAY / EL PAN / SAN VICENTE", "AZUAY / GIRON / ASUNCION",
    "AZUAY / GUALACEO / DANIEL CORDOVA TORAL", "AZUAY / GUALACEO / JADAN", "AZUAY / GUALACEO / LUIS CORDERO VEGA",
    "AZUAY / GUALACEO / MARIANO MORENO", "AZUAY / CUENCA / SAN JOAQUIN", "AZUAY / NABON / COCHAPATA",
    "AZUAY / NABON / EL PROGRESO", "AZUAY / NABON / LAS NIEVES (CHAYA)", "AZUAY / OÑA / SUSUDEL",
    "AZUAY / PAUTE / CHICAN (GUILLERMO ORTEGA)", "AZUAY / PAUTE / DUG-DUG", "AZUAY / PAUTE / EL CABO",
    "AZUAY / PAUTE / GUARAINAG", "AZUAY / PAUTE / SAN CRISTOBAL", "AZUAY / PAUTE / TOMEBAMBA",
    "AZUAY / SAN FERNANDO / CHUMBLIN", "AZUAY / SANTA ISABEL / ABDON CALDERON (LA UNIÓN)",
    "AZUAY / SANTA ISABEL / ZHAGLLI", "AZUAY / SEVILLA DE ORO / AMALUZA", "AZUAY / SIGSIG / CUCHIL",
    "AZUAY / SIGSIG / GIMA", "AZUAY / SIGSIG / GUEL", "AZUAY / SIGSIG / LADO", "AZUAY / SIGSIG / SAN BARTOLOME",
    "AZUAY / SIGSIG / SAN JOSE DE RARANGA", "AZUAY / SEVILLA DE ORO / PALMAS", "AZUAY / PUCARA / SAN RAFAEL DE SHARUG",
    "AZUAY / PAUTE / BULAN (JOSÉ VÍCTOR IZQUIERDO)", "AZUAY / GUALACEO / SIMON BOLIVAR",
    "AZUAY / GUALACEO / SAN JUAN", "AZUAY / GUALACEO / REMIGIO CRESPO TORAL", "AZUAY / GIRON / SAN GERARDO",
    "AZUAY / CUENCA / TARQUI", "AZUAY / CUENCA / PACCHA", "AZUAY / CUENCA / CHECA (JIDCAY)",
    "AZUAY / GUALACEO / ZHIDMAD", "AZUAY / CUENCA / SANTA ANA", "BOLIVAR / GUARANDA / SIMIATUG",
    "BOLIVAR / GUARANDA / SALINAS", "BOLIVAR / SAN JOSE DE CHIMBO / SAN SEBASTIAN",
    "BOLIVAR / CHILLANES / SAN JOSE DEL TAMBO (TAMBOPAMBA)", "BOLIVAR / GUARANDA / FACUNDO VELA",
    "BOLIVAR / GUARANDA / JULIO E. MORENO", "BOLIVAR / GUARANDA / SAN LORENZO",
    "BOLIVAR / GUARANDA / SAN LUIS DE PAMBIL", "BOLIVAR / GUARANDA / SAN SIMON (YACOTO)",
    "BOLIVAR / GUARANDA / SANTAFE (SANTA FE)", "BOLIVAR / SAN JOSE DE CHIMBO / ASUNCION (ASANCOTO)",
    "BOLIVAR / SAN JOSE DE CHIMBO / MAGDALENA (CHAPACOTO)", "BOLIVAR / SAN JOSE DE CHIMBO / TELIMBELA",
    "BOLIVAR / SAN MIGUEL / BILOVAN", "BOLIVAR / SAN MIGUEL / REGULO DE MORA", "BOLIVAR / SAN MIGUEL / SAN PABLO",
    "BOLIVAR / SAN MIGUEL / SAN VICENTE", "BOLIVAR / SAN MIGUEL / SANTIAGO", "BOLIVAR / SAN MIGUEL / BALSAPAMBA",
    "CAÑAR / CAÑAR / SAN ANTONIO", "CAÑAR / CAÑAR / VENTURA", "CAÑAR / CAÑAR / ZHUD",
    "CAÑAR / DELEG / SOLANO", "CAÑAR / LA TRONCAL / MANUEL J. CALLE", "CAÑAR / LA TRONCAL / PANCHO NEGRO",
    "CAÑAR / CAÑAR / HONORATO VASQUEZ", "CAÑAR / CAÑAR / GUALLETURO", "CAÑAR / CAÑAR / GENERAL MORALES",
    "CAÑAR / CAÑAR / DUCUR", "CAÑAR / CAÑAR / CHOROCOPTE", "CAÑAR / CAÑAR / CHONTAMARCA",
    "CAÑAR / BIBLIAN / TURUPAMBA", "CAÑAR / BIBLIAN / NAZON", "CAÑAR / BIBLIAN / JERUSALEN",
    "CAÑAR / AZOGUES / TADAY", "CAÑAR / AZOGUES / SAN MIGUEL", "CAÑAR / AZOGUES / RIVERA",
    "CAÑAR / AZOGUES / LUIS CORDERO", "CAÑAR / AZOGUES / JAVIER LOYOLA", "CAÑAR / AZOGUES / GUAPAN",
    "CAÑAR / CAÑAR / INGAPIRCA", "CAÑAR / BIBLIAN / SAN FRANCISCO DE SAGEO", "CAÑAR / AZOGUES / PINDILIG",
    "CAÑAR / AZOGUES / COJITAMBO", "CAÑAR / CAÑAR / JUNCAL", "CARCHI / MIRA / CONCEPCION",
    "CARCHI / MONTUFAR / CRISTOBAL COLON", "CARCHI / TULCAN / PIOTER", "CARCHI / TULCAN / EL CHICAL",
    "CARCHI / TULCAN / EL CARMELO (EL PUN)", "CARCHI / SAN PEDRO DE HUACA / MARISCAL SUCRE",
    "CARCHI / MONTUFAR / PIARTAL", "CARCHI / MONTUFAR / LA PAZ", "CARCHI / MONTUFAR / FERNANDEZ SALVADOR",
    "CARCHI / MONTUFAR / CHITAN DE NAVARRETE", "CARCHI / MIRA / JUAN MONTALVO", "CARCHI / TULCAN / TUFIÑO",
    "CARCHI / MIRA / JIJON Y CAAMAÑO", "CARCHI / ESPEJO / SAN ISIDRO", "CARCHI / ESPEJO / LA LIBERTAD (ALIZO)",
    "CARCHI / ESPEJO / EL GOALTAL", "CARCHI / LA MANA / SAN VICENTE DE PUSIR", "CARCHI / LA MANA / MONTE OLIVO",
    "CARCHI / LA MANA / LOS ANDES", "CARCHI / LA MANA / GARCIA MORENO", "CARCHI / TULCAN / TOBAR DONOSO (LA BOCANA)",
    "CARCHI / TULCAN / SANTA MARTHA DE CUBA", "CARCHI / TULCAN / JULIO ANDRADE (OREJUELA)",
    "CARCHI / TULCAN / URBINA (TAYA)", "CARCHI / TULCAN / MALDONADO", "CARCHI / LA MANA / SAN RAFAEL",
    "COTOPAXI / PANGUA / RAMON CAMPAÑA", "COTOPAXI / PUJILI / ANGAMARCA", "COTOPAXI / PUJILI / GUANGAJE",
    "COTOPAXI / PUJILI / TINGO", "COTOPAXI / PUJILI / ZUMBAHUA", "COTOPAXI / SALCEDO / CUSUBAMBA",
    "COTOPAXI / SALCEDO / MULLIQUINDIL (SANTA ANA)", "COTOPAXI / SALCEDO / MULALILLO",
    "COTOPAXI / SALCEDO / PANSALEO", "COTOPAXI / SAQUISILI / CANCHAGUA", "COTOPAXI / SAQUISILI / CHANTILIN",
    "COTOPAXI / SAQUISILI / COCHAPAMBA", "COTOPAXI / SIGCHOS / CHUGCHILAN", "COTOPAXI / SIGCHOS / ISINLIVI",
    "COTOPAXI / SIGCHOS / LAS PAMPAS", "COTOPAXI / LA MANA / GUASAGANDA", "COTOPAXI / LA MANA / PUCAYACU",
    "COTOPAXI / LATACUNGA / 11 DE NOVIEMBRE (ILINCHI)", "COTOPAXI / SALCEDO / ANTONIO JOSE HOLGUIN",
    "COTOPAXI / PUJILI / PILALO", "COTOPAXI / PUJILI / LA VICTORIA", "COTOPAXI / SIGCHOS / PALO QUEMADO",
    "COTOPAXI / LATACUNGA / ALAQUES (ALAQUEZ)", "COTOPAXI / LATACUNGA / BELISARIO QUEVEDO", "COTOPAXI / LATACUNGA"
  ];

  instisAutorizadas = [
    "AGENCIA DE REGULACIÓN Y CONTROL EL AGUA", "AGENCIA DE REGULACIÓN Y CONTROL MINERO (ARCOM)",
    "AGENCIA NACIONAL DE REGULACION Y CONTROL DEL TRANSPORTE TERRESTRE TRANSITO Y SEGURIDAD VIAL",
    "AGENCIA NACIONAL DE TRANSITO", "Agencia Nacional de Tránsito", "AGROCALIDAD", "Asamblea Nacional",
    "ASOCIACION DE MUNICIPALIDADES ECUATORIANAS", "Banco de Desarrollo del Ecuador, BP.",
    "Banco del Desarrollo del Ecuador B.P.", "BanEcuador B.P.", "BENEMÉRITO CUERPO DE BOMBEROS DE GUAYAQUIL",
    "BOMBEROS", "CASA DE LA CULTURA CHIMBORAZO", "Casa de la Cultura Ecuatoriana Núcleo del Guayas",
    "CASA DE LA CULTURA NÚCLEO DE CHIMBORAZO", "CCPD", "CNE DELEGACIÓN PROVINCIAL ELECTORAL DE ZAMORA CHINCHIPE",
    "CNE DELEGACION PROVINCIAL ELECTORAL SANTO DOMINGO DE LOS TSACHILAS", "CONAGOPARE AZUAY",
    "Conagopare el oro", "Conagopare El Oro", "CONAGOPARE EL ORO", "CONAGOPARE GUAYAS", "CONAGOPARE TUNGURAHUA",
    "Concejo de Gobierno del Pueblo Shuar Arutam", "Conferencia Plurinacional e Intercultural de Soberania Alimentaria",
    "CONFERENCIA PLURINACIONAL E INTERCULTURAL DE SOBERANÍA ALIMENTARIA", "CONSEJO CANTONAL DE PROTECCION DE DERECHOS DE AZOGUES",
    "Consejo Cantonal para la Protección de Derechos de Arajuno", "Consejo Cantonal Para la Protección de Derechos del Cantón Huamboya",
    "CONSEJO DE EDUCACION SUPERIOR", "Consejo de Gobierno del Régimen Especial de Galápagos", "CONSEJO DE LA JUDICATURA",
    "Consejo de Participación Ciudadana y Control Social", "Consejo de Protección de Drechos del Distrito Metropolitano de Quito",
    "Consejo Nacional de Competencias", "CONSEJO NACIONAL ELECTORAL", "Consejo Nacional para la Igualdad de Género",
    "CONSEJO NACIONAL PARA LA IGUALDAD INTERGENERACIONAL", "CONSORCIO DE GOBIERNOS PROVINCIALES DEL ECUADOR (CONGOPE)",
    "CONSORCIO DE MUNICIPIOS AMAZONICOS Y GALÁPAGOS", "Consulado", "Contraloría General del Estado",
    "COORDINACION ZONAL SERVICIO INTEGRADO DE SEGURIDAD ECU IBARRA", "Corporación Nacional de Telecomunicaciones",
    "Corporación ProIdeas", "Cuerpo de Bomberos del Cantón El Tambo", "CUERPO DE BOMBEROS DEL CANTÓN SUSCAL",
    "CUERPO DE BOMBEROS MUNICIPAL DEL CANTÓN PASTAZA", "Defensoria del Pueblo, Zonal cuatro",
    "DIRECCIÓN GENERAL DE REGISTRO CIVIL, IDENTIFICACIÓN Y CEDULACIÓN", "DIRECCION NACIONAL DE REGISTRO DE DATOS PUBLICOS",
    "EMPRESA ELECTRICA PUBLICA ESTRATÉGICA CORPORACIÓN NACIONAL DE ELECTRICIDAD CNEL EP",
    "Empresa Publica Cuerpo de Bomberos de Milagro", "EMPRESA PUBLICA DE ARIDOS Y ASFALTOS DEL AZUAY ASFALTAR EP",
    "Empresa Pública del Agua", "EMPRESA PÚBLICA DE LA MANCOMUNIDAD DE TRANSITO, TRANSPORTE TERRESTRE Y SEGURIDAD VIAL DE LA PROVINCIA DE",
    "EMPRESA PUBLICA DE MOVILIDAD DE LA MANCOMUNIDAD DE COTOPAXI", "EMPRESA PÚBLICA DE OBRAS, BIENES Y SERVICIOS SANTA ELENA E.P.",
    "EMPRESA PÚBLICA MUNICIPAL DE ASEO DE CUENCA", "EMPRESA PUBLICA MUNICIPAL DE MOVILIDAD, TRANSITO Y TRANSPORTE DE MILAGRO",
    "EMUCE EP", "EpPetroecuador", "ESCUELA POLITECNICA NACIONAL", "ESCUELA SUPERIOR POLITÉCNICA DE CHIMBORAZO",
    "ESCUELA SUPERIOR POLITECNICA DEL LITORAL", "ESPE INNOVATIVA EP", "FARMASOL", "FOSCQ", "FUERZA AÉREA ECUATORIANA",
    "FUERZA AREA ECUATORIANA", "FUNDACIÓN MUNICIPAL TURISMO PARA CUENCA",
    "Gobierno Autonomo Descentralizado Municipal del Cantón La Joya de los Sachas", "Gobiernos Autónomos descentralizados(GADS)",
    "GOLDENCONST Cia. Ltda.", "Gran Victor Eventos", "HOSPITAL PROVINCIAL GENERAL ISIDRO AYORA", "IESS",
    "Instituto Antártico Ecuatoriano", "Instituto de fomento al talento humano", "INSTITUTO GEOGRÁFICO MILITAR",
    "Instituto Nacional de Estadística y Censos", "Instituto Nacional de Evaluación Educativa",
    "INSTITUTO NACIONAL DE INVESTIGACIÓN GEOLÓGICO MINERO METALURGICO", "Instituto Nacional de Patrimonio Cultural",
    "MANCOMUNIDAD MUNDO VERDE O DEL BUEN VIVIR SUMAK SAWKAY", "Ministerio de Agricultura, Ganadería, Acuacultura y Pesca",
    "Ministerio de Comercio Exterior", "Ministerio de Coordinación de la Producción, Empleo y Competitividad",
    "Ministerio de Cultura y Patrimonio", "Ministerio de Desarrollo Urbano y Vivienda", "Ministerio de Educación",
    "Ministerio de Electricidad y Energía Renovable", "Ministerio de Finanzas", "Ministerio de Hidrocarburos",
    "Ministerio de Inclusión Económica y Social", "Ministerio de Industrias y Productividad",
    "Ministerio de Justicia, Derechos Humanos y Culto", "Ministerio del ambiente", "Ministerio del Ambiente",
    "Ministerio del Deporte", "Ministerio del Interior", "Ministerio de Minería", "Ministerio de Relaciones Exteriores y Movilidad Humana",
    "Ministerio de Relaciones Laborales", "MINISTERIO DE SALUD", "Ministerio de Salud Pública",
    "Ministerio de Telecomunicaciones y de la Sociedad de la Información", "Ministerio de Transporte y Obras Públicas",
    "Ministerio de Turismo", "Otros", "PETROAMAZONAS EP", "Plan Binacional de Desarrollo de la Región Fronteriza, Capítulo Ecuador",
    "Plan Binacional de Desarrollo de la Región Fronteriza, CapítulO Ecuador", "PNUD", "Presidencia de la República",
    "Procuraduría General del Estado", "PROGRAMA DE REPARACION INTEGRAL Y SOCIAL", "Registro Civil",
    "REGISTRO DE LA PROPIEDAD DEL CANTÓN SANTO DOMINGO", "Secretaria de Educación Superior Ciencia Tecnología e Innovación",
    "Secretaría Nacional de Comunicación", "Secretaría Nacional de Educación Superior, Ciencia, Tecnología e Innovación",
    "Secretaria Nacional de Gestión de la Política", "Secretaria Nacional de Gestión de Riesgos.",
    "Secretaría Nacional de la Administración Pública", "Secretaria Nacional del Agua.",
    "SECRETARIA NACIONAL DE PLANIFICACION Y DESARROLLO", "Secretaría Nacional de Planificación y Desarrollo",
    "Secretaría Técnica de Cooperación Internacional", "SECRETARIA TÉCNICA PARA LA GESTIÓN INCLUSIVA EN DISCAPACIDADES",
    "SECRETARIA TECNICA PLAN TODA UNA VIDA", "SEGURIDAD", "Sercop", "Servicio de Contratación de obras",
    "Servicio de Gestión Inmobiliaria del Sector Público", "SERVICIO INTEGRADO DE SEGURIDAD ECU PORTOVIEJO",
    "SERVICIO INTEGRADO DE SEGURIDAD ECU SAMBORONDON", "Servicio Nacional de Contratación Pública", "Supercom",
    "SUPERINTENDENCIA DE BANCOS", "TAME AMAZONIA", "Universidad Central del Ecuador", "Universidad de Cuenca",
    "Universidad Nacional de Loja", "Universidad Península de Santa Elena", "Universidad Regional Amazónica IKIAM",
    "UNIVERSIDAD TECNICA DE MACHALA", "UNIVERSIDAD TÉCNICA LUIS VARGAS TORRES", "UPSJ"
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
    const entidadNombre = (selectedEntidad?.nombre || '').toUpperCase();
    const esMunicipal = entidadNombre.includes('MUNICIPAL') || nivelId === resIds.nivelMunicipal;
    const esOtro = entidadNombre.includes('OTRO') || entidadNombre.includes('OTRA');
    const esParroquial = entidadNombre.includes('PARROQUIAL') || nivelId === resIds.nivelParroquial;

    // Para nivel Municipal, usar la lista autorizada
    if (esMunicipal) {
      return this.munisAutorizados.map(name => ({ value: name, label: name }));
    }

    // Para nivel Parroquial Rural, usar la lista autorizada
    if (esParroquial) {
      return this.parrsAutorizadas.map(name => ({ value: name, label: name }));
    }

    // Para nivel OTRO, usar la lista autorizada
    if (esOtro) {
      return this.parrsAutorizadas.map(name => ({ value: name, label: name }));
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
    // this.initRecaptcha(); // --- DESACTIVADO ---
  }

  initRecaptcha() {
    const checkGrecaptcha = setInterval(() => {
      if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
        clearInterval(checkGrecaptcha);
        try {
          this.recaptchaWidgetId = (window as any).grecaptcha.render('register-recaptcha-wrapper', {
            'sitekey': '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
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
      this.cargosOriginal.set(cargosResp || []);
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
      this.competenciasOriginal.set(competenciasResp || []);
      this.gradosOcupacionalesOriginal.set(gradosOcupacionalesResp || []);
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

    // Validación flexible: Permitimos continuar aunque falten datos opcionales
    return true;

    return true;
  }

  // --- Actions ---

  async registerUser() {
    if (!this.termsData().termsAccepted) {
      this.presentToast('Debe aceptar los términos y condiciones', 'warning');
      return;
    }

    const recaptchaToken = ''; // Desactivado por solicitud del usuario

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
