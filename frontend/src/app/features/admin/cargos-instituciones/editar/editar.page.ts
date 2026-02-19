import { Component, OnInit } from '@angular/core';
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
  ]
})
export class EditarPage implements OnInit {
  cargoForm: FormGroup;
  cargoId: number | null = null;

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

  loadCargo(id: number) {
    this.cargService.getById(id).subscribe({
      next: (cargo) => {
        this.cargoForm.patchValue({ nombre: cargo.nombre });
      },
      error: (err) => {
        console.error('Error loading cargo:', err);
        this.presentToast('Cargo no encontrado', 'danger');
        this.router.navigate(['/gestionar-cargos-instituciones']);
      }
    });
  }

  actualizarCargo() {
    if (this.cargoForm.valid && this.cargoId) {
      this.cargService.update(this.cargoId, this.cargoForm.value.nombre).subscribe({
        next: () => {
          this.presentToast('Cargo actualizado exitosamente', 'success');
          this.router.navigate(['/gestionar-cargos-instituciones']);
        },
        error: (err) => {
          console.error('Error updating cargo:', err);
          this.presentToast('Error al actualizar el cargo', 'danger');
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
