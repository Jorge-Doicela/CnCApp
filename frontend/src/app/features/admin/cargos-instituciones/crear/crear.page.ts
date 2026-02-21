import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
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
export class CrearPage {
  cargoForm: FormGroup;
  isSubmitting: boolean = false;
  private cd = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private cargService: CargService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ 'save-outline': saveOutline });
    this.cargoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  async crearCargo() {
    if (this.cargoForm.invalid) return;

    this.isSubmitting = true;
    this.cd.markForCheck();

    try {
      await firstValueFrom(this.cargService.create(this.cargoForm.value.nombre));
      this.presentToast('Cargo creado exitosamente', 'success');
      this.router.navigate(['/gestionar-cargos-instituciones']);
    } catch (err) {
      console.error('Error creating cargo:', err);
      this.presentToast('Error al crear el cargo', 'danger');
    } finally {
      this.isSubmitting = false;
      this.cd.markForCheck();
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
