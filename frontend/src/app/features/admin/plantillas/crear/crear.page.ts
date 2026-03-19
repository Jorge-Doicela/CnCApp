import { Component, OnInit, ElementRef, ViewChild, inject, HostListener, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, LoadingController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PlantillasService } from '../services/plantillas.service';
import { ErrorHandlerUtil } from 'src/app/shared/utils/error-handler.util';
import { PlantillaCertificado } from '../../../../core/models/plantilla.interface';
import { addIcons } from 'ionicons';
import {
    saveOutline,
    cloudUploadOutline,
    arrowBackOutline,
    moveOutline,
    layersOutline,
    imageOutline,
    informationCircleOutline,
    trashOutline,
    qrCodeOutline
} from 'ionicons/icons';

interface DraggableField {
    key: string;
    label: string;
    enabled: boolean;
}

@Component({
    selector: 'app-crear-plantilla',
    templateUrl: './crear.page.html',
    styleUrls: ['./crear.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearPage implements OnInit {
    @ViewChild('canvasContainer') canvasContainer!: ElementRef;

    isEdit = false;
    cargando = false;
    guardando = false;

    // ... (keep existing properties)

    plantilla: PlantillaCertificado = {
        id: 0,
        nombre: '',
        imagenUrl: '',
        configuracion: {
            nombreUsuario: { x: 420, y: 300, fontSize: 32, color: '#1a1a1a' },
            curso: { x: 420, y: 370, fontSize: 18, color: '#333333' },
            fecha: { x: 420, y: 450, fontSize: 14, color: '#666666' }
        },
        activa: false
    };

    fields: DraggableField[] = [
        { key: 'nombreUsuario', label: 'Nombre Participante', enabled: true },
        { key: 'curso', label: 'Nombre Curso', enabled: true },
        { key: 'fecha', label: 'Fecha Emisión', enabled: true },
        { key: 'codigoQR', label: 'Código QR', enabled: false },
        { key: 'cedula', label: 'Cédula', enabled: false },
        { key: 'rol', label: 'Rol', enabled: false },
        { key: 'horas', label: 'Horas', enabled: false },
        { key: 'parrafo', label: 'Párrafo Descriptivo', enabled: false },
    ];

    availableFonts = [
        { name: 'Helvetica (Estándar)', value: 'Helvetica' },
        { name: 'Times Roman (Clásica)', value: 'Times-Roman' },
        { name: 'Courier (Máquina escribir)', value: 'Courier' },
        { name: 'Montserrat (Moderna)', value: 'Montserrat' },
        { name: 'Montserrat Bold (Gruesa)', value: 'Montserrat-Bold' },
        { name: 'Poppins (Limpia)', value: 'Poppins' },
        { name: 'Poppins Bold (Gruesa limpia)', value: 'Poppins-Bold' },
        { name: 'Inter (Versátil)', value: 'Inter' },
        { name: 'Inter Bold (Gruesa versátil)', value: 'Inter-Bold' },
        { name: 'Playfair Display (Elegante)', value: 'PlayfairDisplay' },
        { name: 'Great Vibes (Cursiva firma)', value: 'GreatVibes' }
    ];

    // Drag state
    activeDragKey: string | null = null;
    dragStartX = 0;
    dragStartY = 0;
    fieldStartX = 0;
    fieldStartY = 0;

    private plantillasService = inject(PlantillasService);
    private route = inject(ActivatedRoute);
    private navCtrl = inject(NavController);
    private toastCtrl = inject(ToastController);
    private loadingCtrl = inject(LoadingController);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        addIcons({
            saveOutline,
            cloudUploadOutline,
            arrowBackOutline,
            moveOutline,
            layersOutline,
            imageOutline,
            informationCircleOutline,
            trashOutline,
            qrCodeOutline
        });
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEdit = true;
            this.cargarPlantilla(Number(id));
        }
    }

    async cargarPlantilla(id: number) {
        this.cargando = true;
        this.cdr.markForCheck();
        try {
            const plantilla = await firstValueFrom(this.plantillasService.getPlantilla(id));
            if (plantilla) {
                this.plantilla = JSON.parse(JSON.stringify(plantilla));
                this.sincronizarCampos();
            }
        } catch (error) {
            console.error('Error al cargar plantilla:', error);
            this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
            this.navCtrl.navigateBack('/gestionar-plantillas');
        } finally {
            this.cargando = false;
            this.cdr.markForCheck();
        }
    }

    sincronizarCampos() {
        // Enable fields that exist in configuration
        this.fields.forEach(field => {
            field.enabled = !!this.plantilla.configuracion[field.key as keyof typeof this.plantilla.configuracion];
        });
    }

    toggleField(field: DraggableField) {
        const key = field.key as keyof typeof this.plantilla.configuracion;
        if (field.enabled) {
            // Add field to configuration
            if (!this.plantilla.configuracion[key]) {
                const config: any = this.plantilla.configuracion;
                if (key === 'codigoQR') {
                    // Default bottom right corner, fontSize acts as width/height
                    config[key] = {
                        x: 692,
                        y: 445,
                        fontSize: 100,
                        color: '#000000'
                    };
                } else if (key === 'parrafo') {
                    config[key] = {
                        x: 100,
                        y: 400,
                        fontSize: 14,
                        color: '#000000',
                        fontFamily: 'Helvetica',
                        width: 642,
                        textAlign: 'justify'
                    };
                } else {
                    config[key] = {
                        x: 420,
                        y: 300,
                        fontSize: 16,
                        color: '#000000',
                        fontFamily: 'Helvetica',
                        textAlign: 'center'
                    };
                }
            }
        } else {
            // Remove field from configuration
            delete this.plantilla.configuracion[key];
        }
    }

    getPlaceholder(key: string | any): string {
        const placeholders: Record<string, string> = {
            nombreUsuario: 'JUAN PÉREZ GARCÍA',
            curso: 'GESTIÓN DE COMPETENCIAS',
            fecha: '07/02/2026',
            cedula: '1234567890',
            rol: 'PARTICIPANTE',
            horas: '40 HORAS',
            parrafo: 'Por su participación en el evento de capacitación: "NOMBRE DEL CURSO", realizado en modalidad virtual el 01 de enero de 2026, con una duración de 40 horas.'
        };
        return placeholders[key as string] || 'TEXTO';
    }

    getFontFamilyCss(fontValue?: string): string {
        switch (fontValue) {
            case 'GreatVibes': return "'Great Vibes', cursive";
            case 'Montserrat': 
            case 'Montserrat-Bold': return "'Montserrat', sans-serif";
            case 'Poppins':
            case 'Poppins-Bold': return "'Poppins', sans-serif";
            case 'Inter':
            case 'Inter-Bold': return "'Inter', sans-serif";
            case 'PlayfairDisplay': return "'Playfair Display', serif";
            case 'Times-Roman': return "'Times New Roman', serif";
            case 'Courier': return "'Courier New', monospace";
            default: return 'Helvetica, Arial, sans-serif';
        }
    }

    getFontWeightCss(fontValue?: string): string {
        if (fontValue === 'Montserrat-Bold' || fontValue === 'Poppins-Bold' || fontValue === 'Inter-Bold') return 'bold';
        return 'normal';
    }

    isQRCode(key: string): boolean {
        return key === 'codigoQR';
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.mostrarToast('La imagen no debe superar 5MB', 'warning');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.mostrarToast('Solo se permiten archivos de imagen', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.plantilla.imagenUrl = e.target.result;
            this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
    }

    eliminarImagen() {
        this.plantilla.imagenUrl = '';
    }

    onImageLoad(event: any) {
        // Image loaded successfully
        console.log('Image loaded:', event.target.naturalWidth, 'x', event.target.naturalHeight);
    }

    // Drag and Drop functionality
    startDrag(event: MouseEvent | TouchEvent, key: string | any) {
        event.preventDefault();
        this.activeDragKey = key as string;

        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

        this.dragStartX = clientX;
        this.dragStartY = clientY;

        const config = this.plantilla.configuracion[key as keyof typeof this.plantilla.configuracion];
        if (config) {
            this.fieldStartX = config.x;
            this.fieldStartY = config.y;
        }
    }

    @HostListener('window:resize')
    onResize() {
        // Recalculate scale on window resize
        this.cdr.detectChanges();
    }

    getCanvasTransform(): string {
        if (!this.canvasContainer) return 'scale(1)';
        const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
        // The container aspect ratio is 842/595, so width scaling is sufficient
        const scale = rect.width / 842;
        return `scale(${scale})`;
    }

    @HostListener('document:mousemove', ['$event'])
    @HostListener('document:touchmove', ['$event'])
    onDragMove(event: MouseEvent | TouchEvent) {
        if (!this.activeDragKey) return;

        event.preventDefault(); // Prevent scrolling on touch

        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

        const deltaX = clientX - this.dragStartX;
        const deltaY = clientY - this.dragStartY;

        // Calculate the current scale to map screen pixels back to A4 pixels
        let scale = 1;
        if (this.canvasContainer) {
            const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
            scale = rect.width / 842;
        }

        const deltaXA4 = deltaX / scale;
        const deltaYA4 = deltaY / scale;

        const config = this.plantilla.configuracion[this.activeDragKey as keyof typeof this.plantilla.configuracion];
        if (config) {
            config.x = Math.max(0, this.fieldStartX + deltaXA4);
            config.y = Math.max(0, this.fieldStartY + deltaYA4);
        }
    }

    @HostListener('document:mouseup')
    @HostListener('document:touchend')
    onDragEnd() {
        this.activeDragKey = null;
    }

    updateField(key: string | any) {
        // Trigger change detection
        this.cdr.detectChanges();
    }

    async guardar() {
        // Validation
        if (!this.plantilla.nombre || !this.plantilla.nombre.trim()) {
            this.mostrarToast('El nombre de la plantilla es requerido', 'warning');
            return;
        }

        if (!this.plantilla.imagenUrl) {
            this.mostrarToast('Debes subir una imagen de fondo', 'warning');
            return;
        }

        // Check if at least one field is enabled
        const enabledFields = this.fields.filter(f => f.enabled);
        if (enabledFields.length === 0) {
            this.mostrarToast('Debes habilitar al menos un campo', 'warning');
            return;
        }

        this.guardando = true;
        this.cdr.markForCheck();
        const loading = await this.loadingCtrl.create({
            message: 'Guardando plantilla...'
        });
        await loading.present();

        try {
            await firstValueFrom(this.plantillasService.savePlantilla(this.plantilla));
            await this.mostrarToast('Plantilla guardada correctamente', 'success');
            this.navCtrl.navigateBack('/gestionar-plantillas');
        } catch (error) {
            console.error('Error al guardar plantilla:', error);
            await this.mostrarToast(ErrorHandlerUtil.getErrorMessage(error), 'danger');
        } finally {
            await loading.dismiss();
            this.guardando = false;
            this.cdr.markForCheck();
        }
    }

    async mostrarToast(mensaje: string, color: string = 'primary') {
        const toast = await this.toastCtrl.create({
            message: mensaje,
            duration: 3000,
            position: 'top',
            color: color,
            buttons: [
                {
                    text: 'Cerrar',
                    role: 'cancel'
                }
            ]
        });
        await toast.present();
    }
}
// Force Angular recompile
