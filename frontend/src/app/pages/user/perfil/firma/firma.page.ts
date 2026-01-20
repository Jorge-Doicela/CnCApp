import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { v4 as uuidv4 } from 'uuid';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-firma',
  templateUrl: './firma.page.html',
  styleUrls: ['./firma.page.scss'],
  standalone: false
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
    private navController: NavController
  ) { }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  ngAfterViewInit() {
    // Inicializar el pad de firma después de que la vista esté lista
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

      // Configurar eventos para detectar cuando se está dibujando
      this.signaturePad.addEventListener("beginStroke", () => {
        this.firmaDibujada = true;
      });

      // Ajustar el tamaño del canvas al contenedor
      this.resizeCanvas();

      // Ajustar el tamaño del canvas cuando se cambia el tamaño de la ventana
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
      this.signaturePad.clear(); // Limpiar y volver a dibujar
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
    // Reiniciar variables cuando se cambia el método
    this.firmaDibujada = false;
    this.previewFirma = null;

    // Si se cambia a dibujar, inicializar el pad de firma
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

    const loading = await this.loadingController.create({
      message: 'Guardando firma...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Obtener la imagen en formato base64
      const dataUrl = this.signaturePad.toDataURL('image/png');

      // Subir la firma
      await this.subirFirma(dataUrl);

      this.presentToast('Firma guardada correctamente', 'success');
      this.navController.navigateBack('/ver-perfil');
    } catch (error: any) {
      this.presentToast('Error al guardar la firma: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
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

    const loading = await this.loadingController.create({
      message: 'Guardando firma...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Subir la firma
      await this.subirFirma(this.previewFirma);

      this.presentToast('Firma guardada correctamente', 'success');
      this.navController.navigateBack('/ver-perfil');
    } catch (error: any) {
      this.presentToast('Error al guardar la firma: ' + error.message, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async subirFirma(dataUrl: string) {
    // Convertir dataUrl a Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Generar nombre de archivo único
    const userId = this.usuario.Id_Usuario;
    const filename = `${uuidv4()}.png`;
    const filePath = `firmas/${userId}/${filename}`;

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('imagenes')
      .upload(filePath, blob);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Obtener URL pública
    const { data: urlData } = await supabase.storage
      .from('imagenes')
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // Actualizar perfil en la base de datos
    const { error: updateError } = await supabase
      .from('Usuario')
      .update({ Firma_Usuario: imageUrl })
      .eq('Id_Usuario', this.usuario.Id_Usuario);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Actualizar datos locales
    this.usuario.Firma_Usuario = imageUrl;
    this.tieneFirma = true;
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
