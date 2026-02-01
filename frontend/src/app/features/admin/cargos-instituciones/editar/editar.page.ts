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
    // Como el servicio getAll trae todos, podemos filtrar o llamar a getById si lo implementamos backend.
    // Asumiremos que tenemos que buscar en el array local o implementar getById.
    // Por rapidez, implementaré getById en el servicio. O mejor, como es un CRUD simple,
    // usaré la lista si ya la tengo, pero es mejor llamar al backend.
    // Falta getById en el backend controller y usecase. 
    // Para simplificar y dado que getAll trae pocos datos (cargos), podemos usar find.
    // Pero lo correcto es pedir al backend.
    // Voy a usar un find sobre getAll por ahora para no modificar backend de nuevo o añadir endpoint extra,
    // aunque lo ideal es tener GET /:id.
    // Espera, he olvidado GET /:id en backend?
    // Revisemos rutas.
    // rutas: GET /, POST /, PUT /:id, DELETE /:id. 
    // Falta GET /:id en backend.

    // Solución rápida: Modificaré getAll en servicio para filtrar en cliente o...
    // mejor, permito editar con los datos que ya tengo? No, necesito cargarlos.
    // Usaré getAll y find por id en el cliente. Es ineficiente si son muchos, pero aceptable para catálogos pequeños.

    this.cargService.getAll().subscribe(cargos => {
      const cargo = cargos.find(c => c.id === this.cargoId);
      if (cargo) {
        this.cargoForm.patchValue({ nombre: cargo.nombre });
      } else {
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
