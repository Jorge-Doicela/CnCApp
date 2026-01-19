import { Component, OnInit } from '@angular/core';
import { supabase } from 'src/supabase';
import { ActivatedRoute } from '@angular/router';
import * as QRCode from 'qrcode';
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-certificados',
  templateUrl: './certificados.page.html',
  styleUrls: ['./certificados.page.scss'],
  standalone: false
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

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.capacitacionId = Number(this.route.snapshot.paramMap.get('Id_Capacitacion'));

    if (!this.capacitacionId) {
      console.error('No se encontró el ID de la capacitación');
      return;
    }
    this.recuperarentidades();
    this.recuperarexpocitores();
    this.recuperardatacapacitacion();
    this.recuperardatausuario();
  }

  async recuperardatausuario() {
    try {
      const Id_Usuario = await this.obtenerIdUsuarioActivo();
      let { data: Usuario, error } = await supabase
        .from('Usuario')
        .select('Nombre_Usuario,CI_Usuario,Id_Usuario')
        .eq('Id_Usuario', Id_Usuario)

      if (error) {
        console.error('Error al obtener el usuario:', error);
        return null;
      }
      this.usuarioactual = Usuario ?? [];
      if (this.usuarioactual.length > 0) {
        this.nombreUsuario = this.usuarioactual[0].Nombre_Usuario;
      }

      this.ObtenerRolUsuarioConferencia(this.capacitacionId, Id_Usuario)

      // Verificar si ya existe un hash para este usuario y esta capacitación
      await this.verificarHashExistente(Id_Usuario);

      return true
    } catch (err) {
      console.error('Error inesperado:', err);
      return null;
    }
  }

  async verificarHashExistente(idUsuario: string) {
    try {
      let { data, error } = await supabase
        .from('Certificados')
        .select('Hash')
        .match({
          Id_Usuario: idUsuario,
          Id_Capacitacion: this.capacitacionId
        });

      if (error) {
        console.error('Error al verificar hash existente:', error);
        return;
      }

      if (data && data.length > 0) {
        this.existingHash = data[0].Hash;
        console.log('Hash existente encontrado:', this.existingHash);

        // Si ya existe un hash, generar el QR con ese hash
        if (this.existingHash) {
          const validationUrl = `http://localhost:8100/validar-certificados?hash=${this.existingHash}`;
          this.qrCode = await QRCode.toDataURL(validationUrl, {
            width: 256,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#0000' // Fondo transparente
            }
          });
          this.hashCertificado = this.existingHash;
        }
      }
    } catch (err) {
      console.error('Error al verificar hash existente:', err);
    }
  }

  async obtenerIdUsuarioActivo() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error al obtener el usuario activo:', error.message);
      return null;
    }

    if (data && data.user) {
      this.UIID = data.user.id;
      console.log('UIID:', this.UIID);
      // El generarQr ahora se llamará después de verificar si ya existe un hash
      return this.Obtenerid(data.user.id);
    } else {
      console.log('No hay usuario activo');
      return null;
    }
  }

  async ObtenerRolUsuarioConferencia(IdConferencia: number, idUsuario: string) {
    let { data: Usuarios_Capacitaciones, error } = await supabase
      .from('Usuarios_Capacitaciones')
      .select('Rol_Capacitacion')
      .match({ Id_Usuario: idUsuario, Id_Capacitacion: IdConferencia });
    if (error) {
      console.error('Error al obtener el rol del usuario:', error);
      return null;
    }
    this.rol_usuario_conferiencia = Usuarios_Capacitaciones ?? [];
    return true;
  }

  async Obtenerid(idUsuario: string) {
    let { data: Usuario, error } = await supabase
      .from('Usuario')
      .select('Id_Usuario')
      .eq('auth_uid', idUsuario);

    if (error) {
      console.error('Error al obtener el usuario:', error);
      return null;
    }

    if (Usuario && Usuario.length > 0) {
      return Usuario[0].Id_Usuario;
    } else {
      console.log('No se encontró el usuario');
      return null;
    }
  }

  async recuperardatacapacitacion() {
    let { data: Capacitaciones, error } = await supabase
      .from('Capacitaciones')
      .select('*')
      .eq('Id_Capacitacion', this.capacitacionId);

    if (error) {
      console.error('Error al recuperar la capacitación:', error);
      return;
    }
    this.capacitacion = (Capacitaciones && Capacitaciones.length > 0) ? Capacitaciones[0] : null;
  }

  async recuperarexpocitores() {
    let { data, error } = await supabase
      .from('Capacitaciones')
      .select('ids_usuarios')
      .eq('Id_Capacitacion', this.capacitacionId);

    if (error) {
      console.error('Error al recuperar expositores:', error);
      return;
    }

    const expositorIds = (data ?? []).flatMap((e: any) => e.ids_usuarios || []);
    this.expositores = [];

    for (const expositorId of expositorIds) {
      let { data: usuarioData, error: usuarioError } = await supabase
        .from('Usuario')
        .select('CI_Usuario, Nombre_Usuario, Firma_Usuario')
        .eq('Id_Usuario', expositorId);

      if (usuarioError) {
        console.error('Error al recuperar expositor:', usuarioError);
        continue;
      }

      if (usuarioData && usuarioData.length > 0) {
        const expositor = usuarioData[0];
        if (expositor.Firma_Usuario) {
          this.expositores.push(expositor);
          const base64Image = await this.urlToBase64(expositor.Firma_Usuario);
          this.capacitadoresBase64.push(base64Image);
        } else {
          console.log(`Expositor ${expositor.Nombre_Usuario} no tiene firma, se omitirá.`);
        }
      } else {
        console.error('No se encontraron datos para el expositor con ID:', expositorId);
      }
    }
  }

  async recuperarentidades() {
    let { data, error } = await supabase
      .from('Capacitaciones')
      .select('entidades_encargadas')
      .eq('Id_Capacitacion', this.capacitacionId);

    if (error) {
      console.error('Error al recuperar entidades:', error);
      return;
    }

    const entidadIds = (data ?? []).flatMap((e: any) => e.entidades_encargadas || []);
    this.entidades = [];

    // Recupera los datos de cada entidad
    for (const entidadId of entidadIds) {
      let { data: entidadData, error: entidadError } = await supabase
        .from('Entidades')
        .select('Nombre_Entidad, Imagen_Entidad, Pais_Entidad')
        .eq('Id_Entidad', entidadId);

      if (entidadError) {
        console.error('Error al recuperar entidad:', entidadError);
        continue;
      }

      if (entidadData && entidadData.length > 0) {
        const entidad = entidadData[0];
        this.entidades.push(entidad);

        // Guardar el nombre de la primera entidad para el nombre del archivo
        if (this.entidades.length === 1) {
          this.nombreEntidad = entidad.Nombre_Entidad +
            (entidad.Pais_Entidad ? ` (${entidad.Pais_Entidad})` : '');
        }

        // Convertir Imagen_Entidad (la URL de la imagen) a base64
        if (entidad.Imagen_Entidad) {
          const base64Image = await this.urlToBase64(entidad.Imagen_Entidad);
          this.entidadBase64.push(base64Image);
        }
      } else {
        console.error('No se encontraron datos para la entidad con ID:', entidadId);
      }
    }

    // Una vez que tenemos toda la información necesaria, generamos el QR
    if (!this.existingHash) {
      await this.generarQr();
    }
  }

  async urlToBase64(url: string): Promise<string> {
    // Check if the url is a local asset
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
      // Handle remote URLs as before
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    }
  }

  async generarQr() {
    try {
      if (!this.UIID) {
        console.error('El ID de usuario no está disponible');
        return;
      }

      // Obtener el id_usuario real desde el auth_uid
      const idUsuario = await this.Obtenerid(this.UIID);

      if (!idUsuario) {
        console.error('No se pudo obtener el ID de usuario');
        return;
      }

      // Crear datos para el QR - Usamos una clave constante para el mismo usuario y capacitación
      const qrData = {
        id_capacitacion: this.capacitacionId,
        id_usuario: idUsuario
        // No incluimos timestamp para mantener el mismo hash cada vez
      };

      // Generar hash
      const qrDataString = JSON.stringify(qrData);
      const hash = CryptoJS.SHA256(qrDataString).toString(CryptoJS.enc.Hex);

      // Guardar el hash para usarlo al almacenar en la BD
      this.hashCertificado = hash;

      // URL de validación
      const validationUrl = `http://localhost:8100/validar-certificados?hash=${hash}`;

      // Generar QR con la URL de validación
      this.qrCode = await QRCode.toDataURL(validationUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#0000' // Fondo transparente
        }
      });

      console.log('QR generado con hash:', hash);
      console.log('URL de validación:', validationUrl);

      // Almacenar el hash si no existe previamente
      await this.almacenarHash();

    } catch (error) {
      console.error('Error al generar el QR:', error);
    }
  }

  async almacenarHash() {
    try {
      // Verificar que tenemos datos necesarios
      if (!this.hashCertificado || !this.capacitacionId || !this.UIID) {
        console.error('Faltan datos para almacenar el certificado');
        return;
      }

      // Obtener el id_usuario real desde el auth_uid
      const idUsuario = await this.Obtenerid(this.UIID);

      if (!idUsuario) {
        console.error('No se pudo obtener el ID de usuario');
        return;
      }

      // Verificar si ya existe un registro con el mismo usuario y capacitación
      let { data: existingCert, error: existingError } = await supabase
        .from('Certificados')
        .select('id')
        .match({
          Id_Usuario: idUsuario,
          Id_Capacitacion: this.capacitacionId
        });

      if (existingError) {
        console.error('Error al verificar certificado existente:', existingError);
        return;
      }

      // Si ya existe un certificado para este usuario y capacitación, no agregamos uno nuevo
      if (existingCert && existingCert.length > 0) {
        console.log('El certificado ya existe, no se creará uno nuevo.');
        return;
      }

      // Insertar en la tabla Certificados
      const { data, error } = await supabase
        .from('Certificados')
        .insert([
          {
            Hash: this.hashCertificado,
            Fecha_generado: new Date(),
            Id_Usuario: idUsuario,
            Id_Capacitacion: this.capacitacionId
          }
        ])
        .select();

      if (error) {
        console.error('Error al almacenar el hash:', error);
        return;
      }

      if (data) {
        console.log("Certificado almacenado correctamente:", data);
      }
    } catch (error) {
      console.error('Error en el proceso:', error);
    }
  }

  async generarPDF() {
    // Asegurarnos de que tenemos un hash, ya sea existente o recién creado
    if (!this.hashCertificado) {
      if (!this.existingHash) {
        await this.generarQr();
      } else {
        this.hashCertificado = this.existingHash;
      }
    }

    // Crear nombre personalizado para el archivo PDF
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
              }
            ]
          };
        }),
        {
          text: '',
          margin: [0, 42.5, 0, 0], // Espacio en blanco de 1.5 cm
        },
        {
          text: `Certificado de Reconocimiento`,
          fontSize: 32,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 5],
        },
        {
          text: `Por ocupar el rol de ${this.rol_usuario_conferiencia[0].Rol_Capacitacion}`,
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 5],
        },
        {
          text: `${this.usuarioactual[0].Nombre_Usuario}`,
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
              x2: `${this.usuarioactual[0].Nombre_Usuario}`.length * 15,
              y2: 0,
              lineWidth: 1,
            },
          ],
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        {
          text: `El Consejo Nacional de Competencias de Ecuador certifica oficialmente que ${this.usuarioactual[0].Nombre_Usuario}, con Cédula de Identidad ${this.usuarioactual[0].CI_Usuario}, ha completado satisfactoriamente la capacitación titulada "${this.capacitacion.Nombre_Capacitacion}", impartida bajo la modalidad "${this.capacitacion.Modalidades}", con una duración total de ${this.capacitacion.Horas} horas académicas.

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

    // Crear PDF con nombre personalizado
    const pdfDoc = pdfMake.createPdf(docDefinition);

    // Descargar con nombre personalizado
    pdfDoc.download(nombreArchivo + '.pdf');
  }
}
