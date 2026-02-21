import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonItem, IonLabel, IonInput, IonButton,
  IonIcon, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { CargService } from '../services/cargos.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonItem, IonLabel, IonInput, IonButton,
    IonIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarPage implements OnInit {
  cargoForm: FormGroup;
  cargoId: number | null = null;
  private cd = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private cargService: CargService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {
    addIcons({ 'save-outline': saveOutline });
    this.cargoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargoId = +id;
        this.loadCargo(this.cargoId);
      }
    });
  }

  async loadCargo(id: number) {
    try {
      const cargo = await firstValueFrom(this.cargService.getById(id));
      this.cargoForm.patchValue({ nombre: cargo.nombre });
    } catch (err) {
      console.error('Error loading cargo:', err);
      this.presentToast('Cargo no encontrado', 'danger');
      this.router.navigate(['/gestionar-cargos-instituciones']);
    } finally {
      this.cd.markForCheck();
    }
  }

  async actualizarCargo() {
    if (this.cargoForm.valid && this.cargoId) {
      try {
        await firstValueFrom(this.cargService.update(this.cargoId, this.cargoForm.value.nombre));
        this.presentToast('Cargo actualizado exitosamente', 'success');
        this.router.navigate(['/gestionar-cargos-instituciones']);
      } catch (err) {
        console.error('Error updating cargo:', err);
        this.presentToast('Error al actualizar el cargo', 'danger');
      } finally {
        this.cd.markForCheck();
      }
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
