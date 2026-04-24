import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { EncuestaService } from '../../../../core/services/encuesta.service';
import { CapacitacionesService } from '../services/capacitaciones.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline, statsChartOutline, star, schoolOutline, businessOutline, peopleOutline, chatbubbleEllipsesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-visualizarresultados',
  templateUrl: './visualizarresultados.page.html',
  styleUrls: ['./visualizarresultados.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class VisualizarresultadosPage implements OnInit {
  private route = inject(ActivatedRoute);
  private encuestaService = inject(EncuestaService);
  private capacitacionesService = inject(CapacitacionesService);
  private navCtrl = inject(NavController);
  private cdr = inject(ChangeDetectorRef);

  capacitacionId: number = 0;
  encuesta: any = null;
  resultados: any[] = [];
  loading = true;
  stats: any = {
    promedioSatisfaccion: 0,
    promedioImplementacion: 0,
    totalRespuestas: 0
  };

  constructor() {
    addIcons({ arrowBackOutline, statsChartOutline, star, schoolOutline, businessOutline, peopleOutline, chatbubbleEllipsesOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID obtenido de la ruta:', id);
    if (id && id !== 'undefined' && id !== 'null') {
      this.capacitacionId = Number(id);
      if (!isNaN(this.capacitacionId) && this.capacitacionId > 0) {
        this.cargarDatos();
      } else {
        console.error('ID de capacitación inválido:', id);
        this.loading = false;
      }
    } else {
      console.error('No se encontró ID en la ruta');
      this.loading = false;
    }
  }

  async cargarDatos() {
    this.loading = true;
    console.log('Cargando resultados para capacitación:', this.capacitacionId);
    try {
      // Obtener encuesta
      const encuesta = await this.encuestaService.getEncuestaByCapacitacion(this.capacitacionId).toPromise();
      console.log('Encuesta recuperada:', encuesta);
      this.encuesta = encuesta;

      if (encuesta && encuesta.id) {
        // Obtener resultados
        console.log('Obteniendo resultados para encuesta ID:', encuesta.id);
        const resultados = await this.encuestaService.getResultados(encuesta.id).toPromise();
        this.resultados = resultados || [];
        this.calcularEstadisticas();
      }
    } catch (error) {
      console.error('Error cargando resultados:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  calcularEstadisticas() {
    if (this.resultados.length === 0) return;

    let sumaSat = 0;
    let sumaImp = 0;
    const count = this.resultados.length;

    this.resultados.forEach(r => {
      const sat = (r.satisfaccionObjetivo + r.satisfaccionMetodologia + r.satisfaccionUtilidad + r.satisfaccionConocimiento + r.satisfaccionTiempo) / 5;
      const imp = (r.probabilidadAplicacion + r.probabilidadFacilitacion) / 2;
      sumaSat += sat;
      sumaImp += imp;
    });

    this.stats = {
      promedioSatisfaccion: (sumaSat / count).toFixed(1),
      promedioImplementacion: (sumaImp / count).toFixed(1),
      totalRespuestas: count
    };
  }

  volver() {
    this.navCtrl.back();
  }

  getStars(value: number): number[] {
    return Array(Math.round(value)).fill(0);
  }
}
