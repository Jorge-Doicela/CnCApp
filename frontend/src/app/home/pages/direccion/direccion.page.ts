// direccion.page.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';

declare var google: any;

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-direccion',
  templateUrl: './direccion.page.html',
  styleUrls: ['./direccion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class DireccionPage implements OnInit, AfterViewInit {
  // Inicializar contactForm aquí para resolver error TS2564
  contactForm: FormGroup = this.createForm();
  map: any;

  // Coordenadas de la ubicación del CNC
  private readonly CNC_LATITUDE = -0.1733095;
  private readonly CNC_LONGITUDE = -80.4867844;

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadGoogleMapsScript();
  }

  ngAfterViewInit() {
    // El mapa se inicializará después de cargar la API de Google Maps
  }

  // Getters para acceder a los controles del formulario fácilmente
  get nombreControl(): FormControl {
    return this.contactForm.get('nombre') as FormControl;
  }

  get emailControl(): FormControl {
    return this.contactForm.get('email') as FormControl;
  }

  get mensajeControl(): FormControl {
    return this.contactForm.get('mensaje') as FormControl;
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  // Método para validar el email con reglas estrictas
  validateEmail(email: string): boolean {
    // Primero validar formato básico del email con dominios comunes
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|mil|biz|info|io|me|tv|co|us|uk|ca|de|jp|fr|au|ru|ch|it|nl|se|no|es|mx)$/i;
    if (!basicEmailRegex.test(email)) {
      this.presentToast('Por favor, ingrese un correo electrónico válido con un dominio conocido (.com, .net, .org, etc.)');
      return false;
    }

    // Luego validar que use un proveedor de correo conocido
    const knownProviderRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|hotmail|yahoo|icloud|aol|protonmail|zoho|mail|gmx|yandex|live|msn|inbox)\.(com|net|org)$/i;
    if (!knownProviderRegex.test(email)) {
      this.presentToast('Por favor, utilice un proveedor de correo conocido como Gmail, Outlook, Hotmail, Yahoo, etc.');
      return false;
    }

    return true;
  }

  // Método para mostrar mensajes toast
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'warning'
    });
    toast.present();
  }

  loadGoogleMapsScript() {
    // Verificar si el script ya está cargado
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA3zMPBIcMhZuEsusECycFEYkPWxVlDK04&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Arreglando el error de tipado con window['initMap']
      (window as any)['initMap'] = () => {
        this.initializeMap();
      };

      document.head.appendChild(script);
    } else {
      // Si ya está cargado, inicializar el mapa directamente
      this.initializeMap();
    }
  }

  initializeMap() {
    const mapOptions = {
      center: { lat: this.CNC_LATITUDE, lng: this.CNC_LONGITUDE },
      zoom: 16,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels.text',
          stylers: [{ visibility: 'on' }]
        },
        {
          featureType: 'administrative',
          elementType: 'labels.text',
          stylers: [{ weight: 0.8 }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#E3F2FD' }]
        }
      ]
    };

    const mapElement = document.getElementById('map');

    if (mapElement) {
      this.map = new google.maps.Map(mapElement, mapOptions);

      // Añadir marcador para el CNC
      const marker = new google.maps.Marker({
        position: { lat: this.CNC_LATITUDE, lng: this.CNC_LONGITUDE },
        map: this.map,
        title: 'Consejo Nacional de Competencias',
        animation: google.maps.Animation.DROP,
        icon: {
          url: '../../../../assets/marker.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      });

      // Añadir información cuando se hace clic en el marcador
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 280px;">
            <h3 style="color: #0066cc; margin-top: 0; margin-bottom: 5px;">Consejo Nacional de Competencias</h3>
            <p style="margin-top: 5px; margin-bottom: 5px;">
              <strong>Dirección:</strong> Plataforma Gubernamental Financiera, bloque rojo, tercer piso, ala sur.<br>
              Av. Amazonas entre Juan José Villalengua y Unión Nacional de Periodistas.
            </p>
            <p style="margin-top: 5px; margin-bottom: 5px;">
              <strong>Teléfono:</strong> 02 3834 004
            </p>
            <p style="margin-top: 5px; margin-bottom: 5px;">
              <strong>Horario:</strong> Lunes a Viernes de 8:30 a 17:30
            </p>
            <a href="https://maps.google.com/maps?daddr=${this.CNC_LATITUDE},${this.CNC_LONGITUDE}" target="_blank" style="color: #0066cc; text-decoration: none; font-weight: bold;">
              Cómo llegar ↗
            </a>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });

      // Abrir el infoWindow por defecto
      infoWindow.open(this.map, marker);
    }
  }

  async enviarContacto() {
    if (this.contactForm.invalid) {
      // Verificar qué campo específico está inválido
      if (this.nombreControl.invalid) {
        this.presentToast('Por favor ingrese un nombre válido');
        return;
      }
      if (this.mensajeControl.invalid) {
        this.presentToast('El mensaje debe tener al menos 10 caracteres');
        return;
      }
      return;
    }

    // Validación adicional para el email
    if (!this.validateEmail(this.emailControl.value)) {
      // No necesitamos mostrar toast aquí porque validateEmail ya lo hace
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Enviando mensaje...',
      spinner: 'circles'
    });

    await loading.present();

    const formData = this.contactForm.value;

    // Cuerpo del email
    const emailData = {
      to: 'info@competencias.gob.ec',
      subject: `Mensaje de contacto - ${formData.nombre}`,
      body: `
        <h3>Mensaje de contacto desde el sitio web</h3>
        <p><strong>Nombre:</strong> ${formData.nombre}</p>
        <p><strong>Correo electrónico:</strong> ${formData.email}</p>
        <p><strong>Teléfono:</strong> ${formData.telefono || 'No proporcionado'}</p>
        <h4>Mensaje:</h4>
        <p>${formData.mensaje}</p>
      `,
      replyTo: formData.email
    };

    try {
      // Enviar email usando un servicio backend
      // Esto es un ejemplo y debe adaptarse a tu API real
      await this.http.post(`${environment.supabaseUrl}/api/send-email`, emailData).toPromise();

      await loading.dismiss();

      const toast = await this.toastController.create({
        message: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.',
        duration: 3000,
        position: 'bottom',
        color: 'success',
        buttons: [
          {
            text: 'Cerrar',
            role: 'cancel'
          }
        ]
      });

      await toast.present();

      // Limpiar formulario después de enviar
      this.contactForm.reset();

    } catch (error) {
      await loading.dismiss();

      const alert = await this.alertController.create({
        header: 'Error al enviar mensaje',
        message: 'Ha ocurrido un error al enviar tu mensaje. Por favor intenta nuevamente o contáctanos directamente por teléfono.',
        buttons: ['Aceptar']
      });

      await alert.present();
      console.error('Error al enviar email:', error);
    }
  }
}
