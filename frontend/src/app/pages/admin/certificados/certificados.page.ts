import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as QRCode from 'qrcode';
import * as CryptoJS from 'crypto-js';
import { CertificadosService } from 'src/app/services/certificados.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';

const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

@Component({
  selector: 'app-certificados',
  templateUrl: './certificados.page.html',
  styleUrls: ['./certificados.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CertificadosPage implements OnInit {

  entidades: any[] = [];
  expositores: any[] = [];
  usuario: any = {};
  usuarioactual: any[] = [];
  rol_usuario_conferiencia: any[] = [];
  entidad: any = {};
  capacitacion: any = {};
  imageBase64: string = '';
  qrCode: string = '';
  entidadBase64: string[] = [];
  capacitadoresBase64: string[] = [];
  capacitacionId!: number;
  idUsuario: string = '';
  UIID: string = ''
  hashCertificado: string = '';
  nombreEntidad: string = '';
  nombreUsuario: string = '';
  existingHash: string | null = null;

  private certificadosService = inject(CertificadosService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.capacitacionId = Number(this.route.snapshot.paramMap.get('Id_Capacitacion'));

    if (!this.capacitacionId) {
      console.error('No se encontró el ID de la capacitación');
      return;
    }
    // We fetch data in parallel or sequence, refactored to use services
    this.cargarDatosCompleto();
  }

  async cargarDatosCompleto() {
    // 1. Obtener usuario actual
    const authUser = this.authService.currentUser();
    if (!authUser) {
      // Try to load from localeStorage if page refreshed
      // For now, assume authenticated or handle error
    }

    const userId = localStorage.getItem('auth_uid'); // Using auth_uid logic from before
    if (!userId) return;
    this.UIID = userId; // auth_uid

    try {
      // En un escenario real, llamaríamos a un endpoint de backend que nos de TODO (cert data)
      // Simulamos la recuperación de datos usando los servicios

      // Recuperar datos usuario
      this.usuarioService.getUsuario(Number(userId)).subscribe(u => { // Assuming userId is number
        this.usuarioactual = [u];
        this.nombreUsuario = u?.Nombre_Usuario;
        this.idUsuario = u?.Id_Usuario; // Real ID

        if (this.idUsuario) {
          this.verificarHashExistente(this.idUsuario);
          this.ObtenerRolUsuarioConferencia(this.capacitacionId, this.UIID);
        }
      });

      // Recuperar datos capacitación
      this.certificadosService.getCertificateData(this.capacitacionId).subscribe(data => {
        if (data) {
          this.capacitacion = data.capacitacion;
          this.entidades = data.entidades || [];
          this.expositores = data.expositores || [];

          // Process images
          this.procesarImagenesEntidades();
          this.procesarImagenesExpositores();
        }
      });

    } catch (err) {
      console.error(err);
    }
  }

  async recuperarDataUsuario() {
  }

  async verificarHashExistente(idUsuario: string) {
  }

  async obtenerIdUsuarioActivo() {
    return this.UIID;
  }

  async ObtenerRolUsuarioConferencia(IdConferencia: number, idUsuario: string) {
    this.certificadosService.getUserRoleInConference(IdConferencia, idUsuario).subscribe({
      next: (data) => {
        this.rol_usuario_conferiencia = data || [];
      },
      error: (err) => console.error('Error fetching role:', err)
    });
  }

  async procesarImagenesEntidades() {
    // Loop through this.entidades and convert images
    this.entidadBase64 = [];
    for (const entidad of this.entidades) {
      if (entidad.Imagen_Entidad) {
        const base64 = await this.urlToBase64(entidad.Imagen_Entidad);
        this.entidadBase64.push(base64);
      }
    }
    // Save first entity name
    if (this.entidades.length > 0) {
      const entidad = this.entidades[0];
      this.nombreEntidad = entidad.Nombre_Entidad + (entidad.Pais_Entidad ? ` (${entidad.Pais_Entidad})` : '');
    }

    if (!this.existingHash) {
      await this.generarQr();
    }
  }

  async procesarImagenesExpositores() {
    this.capacitadoresBase64 = [];
    for (const expositor of this.expositores) {
      if (expositor.Firma_Usuario) {
        const base64 = await this.urlToBase64(expositor.Firma_Usuario);
        this.capacitadoresBase64.push(base64);
      }
    }
  }

  async urlToBase64(url: string): Promise<string> {
    if (!url) return '';
    try {
      if (url.startsWith('assets/')) {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          };
          img.onerror = (error) => reject(error);
          img.src = url;
        });
      } else {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(blob);
        });
      }
    } catch (e) {
      console.error('Error converting image', e);
      return '';
    }
  }

  async generarQr() {
    try {
      if (!this.idUsuario) {
        console.error('El ID de usuario no está disponible');
        return;
      }

      const qrData = {
        id_capacitacion: this.capacitacionId,
        id_usuario: this.idUsuario
      };

      const qrDataString = JSON.stringify(qrData);
      const hash = CryptoJS.SHA256(qrDataString).toString(CryptoJS.enc.Hex);
      this.hashCertificado = hash;

      const validationUrl = `http://localhost:8100/validar-certificados?hash=${hash}`;

      this.qrCode = await QRCode.toDataURL(validationUrl, {
        width: 256,
        margin: 1,
        color: { dark: '#000000', light: '#0000' }
      });

      this.almacenarHash();
    } catch (error) {
      console.error('Error al generar el QR:', error);
    }
  }

  async almacenarHash() {
    // Use service to save
    if (!this.hashCertificado) return;

    this.certificadosService.saveCertificate({
      Hash: this.hashCertificado,
      Fecha_generado: new Date(),
      Id_Usuario: this.idUsuario,
      Id_Capacitacion: this.capacitacionId
    }).subscribe({
      next: (res) => console.log('Certificate saved', res),
      error: (err) => console.error('Error saving certificate', err)
    });
  }

  async generarPDF() {
    if (!this.hashCertificado && !this.existingHash) {
      await this.generarQr();
    }

    // ... PDF generation logic matches original mostly ...
    // Simplified for brevity, assume similar structure
    let nombreArchivo = 'Certificado';
    if (this.nombreEntidad) {
      nombreArchivo = this.nombreEntidad;
    }

    if (this.nombreUsuario) {
      nombreArchivo += ' - Certificado de ' + this.nombreUsuario;
    } else {
      nombreArchivo += ' - Certificado';
    }

    // Convertir la imagen de fondo a base64
    const backgroundImageBase64 = await this.urlToBase64('assets/certificados/plantilla.png');

    const docDefinition = {
      background: {
        image: backgroundImageBase64,
        width: 841.89, // A4 landscape width in points (297mm)
        height: 595.28 // A4 landscape height in points (210mm)
      },
      content: [
        {
          image: this.qrCode,
          fit: [100, 100],
          margin: [0, 10, 0, 5],
          absolutePosition: { x: 670, y: 100 }
        },
        this.entidades.map((entidad, index) => {
          return {
            columns: [
              {
                width: 800,
                stack: [
                  {
                    image: this.entidadBase64[index],
                    fit: [120, 120],
                    margin: [0, 0, 0, 0],
                    alignment: 'center',
                  },
                ],
                margin: [0, 10, 0, 0],
                alignment: 'center'
              }
            ]
          };
        }),
        { text: '', margin: [0, 42.5, 0, 0] },
        {
          text: `Certificado de Reconocimiento`,
          fontSize: 32,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 5],
        },
        {
          text: `Por ocupar el rol de ${this.rol_usuario_conferiencia.length > 0 ? this.rol_usuario_conferiencia[0].Rol_Capacitacion : 'Participante'}`,
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 5],
        },
        {
          text: `${this.nombreUsuario}`,
          fontSize: 28,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 5],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: `${this.nombreUsuario}`.length * 15,
              y2: 0,
              lineWidth: 1,
            },
          ],
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        {
          text: `El Consejo Nacional de Competencias de Ecuador certifica oficialmente que ${this.nombreUsuario}, con Cédula de Identidad ${this.usuarioactual.length > 0 ? this.usuarioactual[0].CI_Usuario : ''}, ha completado satisfactoriamente la capacitación titulada "${this.capacitacion.Nombre_Capacitacion || ''}", impartida bajo la modalidad "${this.capacitacion.Modalidades || ''}", con una duración total de ${this.capacitacion.Horas || '0'} horas académicas.
            En reconocimiento a su participación activa y aprovechamiento en el programa de formación profesional, se expide el presente certificado.
            Emitido en Ecuador, el ${new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
          fontSize: 14,
          alignment: 'center',
          margin: [40, 20, 40, 20],
        },
        {
          columns: this.expositores.map((expositor, index) => {
            return {
              width: '*',
              stack: [
                {
                  image: this.capacitadoresBase64[index],
                  fit: [80, 80],
                  alignment: 'center',
                },
                {
                  canvas: [
                    {
                      type: 'line',
                      x1: 0,
                      y1: 0,
                      x2: `${expositor.Nombre_Usuario}`.length * 6, // Calcula dinámicamente la longitud de la línea
                      y2: 0,
                      lineWidth: 1,
                    },
                  ],
                  margin: [0, 5, 0, 5],
                  alignment: 'center',
                },
                {
                  text: `${expositor.Nombre_Usuario}`,
                  fontSize: 10,
                  alignment: 'center',
                },
                {
                  text: `CI: ${expositor.CI_Usuario}`,
                  fontSize: 8,
                  alignment: 'center',
                },
              ],
              margin: [5, 0, 5, 0],
            };
          }),
          columnGap: 10,
          margin: [20, 10, 20, 0],
        }
      ],
      pageOrientation: 'landscape',
      pageMargins: [40, 40, 40, 40],
      pageSize: 'A4',
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.download(nombreArchivo + '.pdf');
  }
}
