import { Component } from '@angular/core';
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
  ]
})
export class CrearPage {
  cargoForm: FormGroup;

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

  crearCargo() {
    if (this.cargoForm.valid) {
      this.cargService.create(this.cargoForm.value.nombre).subscribe({
        next: () => {
          this.presentToast('Cargo creado exitosamente', 'success');
          this.router.navigate(['/gestionar-cargos-instituciones']);
        },
        error: (err) => {
          console.error('Error creating cargo:', err);
          this.presentToast('Error al crear el cargo', 'danger');
        }
      });
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
