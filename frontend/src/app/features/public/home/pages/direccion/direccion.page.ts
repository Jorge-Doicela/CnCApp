// direccion.page.ts
import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

declare var google: any;

import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonButtons,
  IonTitle, IonContent, IonIcon, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline, callOutline, timeOutline,
  mailOutline, personOutline, chatbubbleOutline,
  sendOutline, busOutline, carOutline, arrowBackOutline, navigateOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-direccion',
  templateUrl: './direccion.page.html',
  styleUrls: ['./direccion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonButtons,
    IonTitle, IonContent, IonIcon, RouterModule,
    IonButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DireccionPage implements OnInit, AfterViewInit {
  map: any;

  // Coordenadas de la ubicación del CNC (Plataforma Gubernamental Financiera)
  private readonly CNC_LATITUDE = -0.1772439;
  private readonly CNC_LONGITUDE = -78.4891122;

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private http: HttpClient
  ) {
    addIcons({
      'location-outline': locationOutline,
      'call-outline': callOutline,
      'time-outline': timeOutline,
      'mail-outline': mailOutline,
      'person-outline': personOutline,
      'chatbubble-outline': chatbubbleOutline,
      'send-outline': sendOutline,
      'bus-outline': busOutline,
      'car-outline': carOutline,
      'arrow-back-outline': arrowBackOutline,
      'navigate-outline': navigateOutline
    });
  }

  ngOnInit() {
    this.loadGoogleMapsScript();
  }

  ngAfterViewInit() {
    // El mapa se inicializará después de cargar la API de Google Maps
  }

  loadGoogleMapsScript() {
    // Verificar si el script ya está cargado
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      const script = document.createElement('script');
      // Versión más moderna de la URL de carga con async y bibliotecas necesarias
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA3zMPBIcMhZuEsusECycFEYkPWxVlDK04&callback=initMap&libraries=marker&v=beta&loading=async`;
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

  async initializeMap() {
    // Importar librerías necesarias de forma asíncrona (patrón recomendado)
    const { Map } = await (google.maps as any).importLibrary("maps");
    const { AdvancedMarkerElement } = await (google.maps.marker as any).AdvancedMarkerElement ? { AdvancedMarkerElement: (google.maps.marker as any).AdvancedMarkerElement } : await (google.maps as any).importLibrary("marker");

    const mapOptions = {
      center: { lat: this.CNC_LATITUDE, lng: this.CNC_LONGITUDE },
      zoom: 16,
      mapId: 'DEMO_MAP_ID', // Requerido para AdvancedMarkerElement
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true
    };

    const mapElement = document.getElementById('map');

    if (mapElement) {
      this.map = new Map(mapElement, mapOptions);

      // Crear un elemento de imagen para el marcador personalizado
      const markerImage = document.createElement('img');
      markerImage.src = 'assets/marker.png';
      markerImage.style.width = '40px';
      markerImage.style.height = '40px';

      // Añadir marcador para el CNC usando AdvancedMarkerElement
      const marker = new AdvancedMarkerElement({
        map: this.map,
        position: { lat: this.CNC_LATITUDE, lng: this.CNC_LONGITUDE },
        title: 'Consejo Nacional de Competencias',
        content: markerImage
      });

      // Añadir información cuando se hace clic en el marcador
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 280px; font-family: 'Inter', sans-serif;">
            <h3 style="color: #0066cc; margin-top: 0; margin-bottom: 8px; font-weight: 700;">Consejo Nacional de Competencias</h3>
            <p style="margin-top: 5px; margin-bottom: 5px; color: #4b5563; font-size: 0.9rem;">
              <strong>Dirección:</strong> Plataforma Gubernamental Financiera, bloque rojo, tercer piso, ala sur.<br>
              Av. Amazonas entre Juan José Villalengua y Unión Nacional de Periodistas.
            </p>
            <p style="margin-top: 5px; margin-bottom: 5px; color: #4b5563; font-size: 0.9rem;">
              <strong>Teléfono:</strong> 02 3834 004
            </p>
            <p style="margin-top: 5px; margin-bottom: 5px; color: #4b5563; font-size: 0.9rem;">
              <strong>Horario:</strong> Lunes a Viernes de 8:30 a 17:30
            </p>
            <div style="margin-top: 12px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
              <a href="https://maps.google.com/maps?daddr=${this.CNC_LATITUDE},${this.CNC_LONGITUDE}" target="_blank" style="color: #0066cc; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                <span>Cómo llegar</span>
                <span style="font-size: 1.1rem;">↗</span>
              </a>
            </div>
          </div>
        `
      });

      marker.addListener('gmp-click', () => {
        infoWindow.open({
          anchor: marker,
          map: this.map
        });
      });

      // Abrir el infoWindow por defecto
      infoWindow.open({
        anchor: marker,
        map: this.map
      });
    }
  }
}
