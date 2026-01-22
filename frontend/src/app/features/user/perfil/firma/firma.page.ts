import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { v4 as uuidv4 } from 'uuid';
import SignaturePad from 'signature_pad';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-firma',
  templateUrl: './firma.page.html',
  styleUrls: ['./firma.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class FirmaPage implements OnInit, AfterViewInit {
  @ViewChild('signaturePad') signaturePadElement!: ElementRef;
  signaturePad: any;

  usuario: any = null;
  cargando: boolean = true;
  guardando: boolean = false;
  tieneFirma: boolean = false;
  metodoSeleccionado: string = 'dibujar';
  firmaDibujada: boolean = false;
  previewFirma: string | null = null;

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private navController: NavController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  ngAfterViewInit() {
    this.inicializarSignaturePad();
  }

  inicializarSignaturePad() {
    if (this.metodoSeleccionado === 'dibujar' && this.signaturePadElement) {
      const canvas = this.signaturePadElement.nativeElement;
      this.signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        velocityFilterWeight: 0.7
      });

      this.signaturePad.addEventListener("beginStroke", () => {
        this.firmaDibujada = true;
      });

      this.resizeCanvas();

      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });
    }
  }

  resizeCanvas() {
    if (this.signaturePad && this.signaturePadElement) {
      const canvas = this.signaturePadElement.nativeElement;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const parentWidth = canvas.parentElement.offsetWidth;

      canvas.width = parentWidth * ratio;
      canvas.height = (parentWidth * 0.5) * ratio;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${parentWidth * 0.5}px`;

      canvas.getContext('2d').scale(ratio, ratio);
      this.signaturePad.clear();
      this.firmaDibujada = false;
    }
  }

  cargarDatosUsuario() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      const state = navigation.extras.state as any;
      this.usuario = state.usuario;

      if (this.usuario && this.usuario.Firma_Usuario) {
        this.tieneFirma = true;
      }
    }

    this.cargando = false;
  }

  cambiarMetodo() {
    this.firmaDibujada = false;
    this.previewFirma = null;

    if (this.metodoSeleccionado === 'dibujar') {
      setTimeout(() => {
        this.inicializarSignaturePad();
      }, 100);
    }
  }

  limpiarFirma() {
    if (this.signaturePad) {
      this.signaturePad.clear();
      this.firmaDibujada = false;
    }
  }

  async seleccionarImagenFirma() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        correctOrientation: true
      });

      if (image.dataUrl) {
        this.previewFirma = image.dataUrl;
      }
    } catch (error: any) {
      this.presentToast('Error al seleccionar la imagen: ' + error.message, 'danger');
    }
  }

  cancelarSubidaFirma() {
    this.previewFirma = null;
  }

  async guardarFirma() {
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      this.presentToast('Por favor, dibuje su firma antes de guardar', 'warning');
      return;
    }

    const confirmar = await this.mostrarConfirmacion(
      '¿Guardar esta firma?',
      'Esta firma se utilizará para certificados y documentos oficiales.'
    );

    if (!confirmar) return;

    // TODO: Implementar guardado de firma (imagen) en backend
    this.presentToast('Funcionalidad de guardado de firma pendiente de migración a Backend', 'warning');
  }

  async guardarFirmaImagen() {
    if (!this.previewFirma) {
      this.presentToast('Por favor, seleccione una imagen antes de guardar', 'warning');
      return;
    }

    const confirmar = await this.mostrarConfirmacion(
      '¿Guardar esta firma?',
      'Esta firma se utilizará para certificados y documentos oficiales.'
    );

    if (!confirmar) return;

    // TODO: Implementar guardado de firma (imagen) en backend
    this.presentToast('Funcionalidad de guardado de firma pendiente de migración a Backend', 'warning');
  }

  async subirFirma(dataUrl: string) {
    // Deprecated: Supabase implementation removed
    console.warn('subirFirma: Backend implementation required');
  }

  async mostrarConfirmacion(header: string, message: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              resolve(false);
            }
          }, {
            text: 'Confirmar',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });

      await alert.present();
    });
  }

  cancelar() {
    this.navController.navigateBack('/ver-perfil');
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
