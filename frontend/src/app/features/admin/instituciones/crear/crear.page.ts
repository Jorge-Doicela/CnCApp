import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.page.html',
  styleUrls: ['./crear.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CrearPage implements OnInit {

  nuevaInstitucion = {
    nombre_institucion: '',
    direccion: '',
    telefono: '',
    email: '',
    descripcion: '',
    estado_institucion: true
  };

  enviando: boolean = false;
  private catalogoService = inject(CatalogoService);

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() { }

  async crearInstitucion() {
    if (!this.nuevaInstitucion.nombre_institucion.trim()) {
      this.presentToast('El nombre de la institución es obligatorio', 'warning');
      return;
    }

    this.enviando = true;
    const loading = await this.loadingController.create({
      message: 'Guardando institución...',
      spinner: 'crescent'
    });
    await loading.present();

    const nuevaInstitucionData = {
      nombre_institucion: this.nuevaInstitucion.nombre_institucion,
      direccion: this.nuevaInstitucion.direccion || null,
      telefono: this.nuevaInstitucion.telefono || null,
      email: this.nuevaInstitucion.email || null,
      descripcion: this.nuevaInstitucion.descripcion || null,
      estado_institucion: this.nuevaInstitucion.estado_institucion,
      fecha_ultima_actualizacion: new Date().toISOString()
    };

    this.catalogoService.createItem('instituciones', nuevaInstitucionData).subscribe({
      next: async () => {
        this.presentToast('Institución creada exitosamente', 'success');
        this.router.navigate(['/gestionar instituciones']);
        loading.dismiss();
        this.enviando = false;
      },
      error: async (error) => {
        console.error('Error al crear institución:', error);
        this.presentToast('Error al crear la institución: ' + (error.message || error.statusText), 'danger');
        loading.dismiss();
        this.enviando = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/gestionar instituciones']);
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      buttons: [
        {
          side: 'end',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
