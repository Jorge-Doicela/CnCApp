import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { EncuestaService } from '../../../core/services/encuesta.service';

@Component({
  selector: 'app-encuesta',
  templateUrl: './encuesta.page.html',
  styleUrls: ['./encuesta.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EncuestaPage implements OnInit {
  private route = inject(ActivatedRoute);
  private encuestaService = inject(EncuestaService);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);

  capacitacionId: number = 0;
  encuestaId: number = 0;
  submitting = false;

  formData: any = {
    nivelGobierno: '',
    satisfaccionObjetivo: null,
    satisfaccionMetodologia: null,
    satisfaccionUtilidad: null,
    satisfaccionConocimiento: null,
    satisfaccionTiempo: null,
    probabilidadAplicacion: null,
    probabilidadFacilitacion: null,
    recomendaciones: '',
    temasInteres: ''
  };

  causas = {
    apoyo: false,
    recursos: false,
    rotacion: false
  };

  satisfaccionItems = [
    { key: 'satisfaccionObjetivo', label: 'Cumplimiento del objetivo del evento' },
    { key: 'satisfaccionMetodologia', label: 'Metodología aplicada (claridad, técnica, recursos)' },
    { key: 'satisfaccionUtilidad', label: 'Utilidad de los contenidos impartidos en el evento' },
    { key: 'satisfaccionConocimiento', label: 'Aporte de nuevos conocimientos' },
    { key: 'satisfaccionTiempo', label: 'Tiempo destinado al evento' }
  ];

  implementacionItems = [
    { key: 'probabilidadAplicacion', label: '¿Cuán probable es que aplique los conocimientos recibidos en su trabajo?' },
    { key: 'probabilidadFacilitacion', label: '¿Los conocimientos adquiridos facilitarán sus actividades?' }
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.capacitacionId = Number(params['capacitacionId']);
      this.encuestaId = Number(params['encuestaId']);
      
      if (!this.capacitacionId || !this.encuestaId) {
        this.showToast('Información de capacitación no válida', 'danger');
        this.navCtrl.back();
      }
    });
  }

  isLowProbability(): boolean {
    return (this.formData.probabilidadAplicacion && this.formData.probabilidadAplicacion <= 2) || 
           (this.formData.probabilidadFacilitacion && this.formData.probabilidadFacilitacion <= 2);
  }

  isFormValid(): boolean {
    const requiredFields = [
      'nivelGobierno',
      'satisfaccionObjetivo', 'satisfaccionMetodologia', 'satisfaccionUtilidad', 'satisfaccionConocimiento', 'satisfaccionTiempo',
      'probabilidadAplicacion', 'probabilidadFacilitacion',
      'recomendaciones', 'temasInteres'
    ];
    return requiredFields.every(field => !!this.formData[field]);
  }

  async onSubmit() {
    if (!this.isFormValid()) return;

    this.submitting = true;
    
    // Preparar causas limitantes como string
    const causasArray = [];
    if (this.causas.apoyo) causasArray.push('Limitado apoyo institucional');
    if (this.causas.recursos) causasArray.push('Recursos insuficientes');
    if (this.causas.rotacion) causasArray.push('Alta rotación de personal');
    
    const payload = {
      ...this.formData,
      encuestaId: this.encuestaId,
      causaLimitacion: causasArray.join(', ')
    };

    this.encuestaService.submitRespuesta(payload).subscribe({
      next: () => {
        this.showToast('Encuesta enviada exitosamente. ¡Gracias!', 'success');
        this.navCtrl.navigateBack(['/ver-certificaciones'], { queryParams: { idCapacitacion: this.capacitacionId } });
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error al enviar la encuesta', 'danger');
        this.submitting = false;
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
