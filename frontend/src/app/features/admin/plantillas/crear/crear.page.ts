import { Component, OnInit, ElementRef, ViewChild, inject, HostListener, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, LoadingController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PlantillasService } from '../services/plantillas.service';
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
    trashOutline
} from 'ionicons/icons';

interface DraggableField {
    key: Extract<keyof PlantillaCertificado['configuracion'], string>;
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
        { key: 'cedula', label: 'Cédula', enabled: false },
        { key: 'rol', label: 'Rol', enabled: false },
        { key: 'horas', label: 'Horas', enabled: false },
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
            trashOutline
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
            this.mostrarToast('Error al cargar plantilla', 'danger');
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
                config[key] = {
                    x: 420,
                    y: 300,
                    fontSize: 16,
                    color: '#000000'
                };
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
            horas: '40 HORAS'
        };
        return placeholders[key as string] || 'TEXTO';
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

    @HostListener('document:mousemove', ['$event'])
    @HostListener('document:touchmove', ['$event'])
    onDragMove(event: MouseEvent | TouchEvent) {
        if (!this.activeDragKey) return;

        event.preventDefault(); // Prevent scrolling on touch

        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

        const deltaX = clientX - this.dragStartX;
        const deltaY = clientY - this.dragStartY;

        const config = this.plantilla.configuracion[this.activeDragKey as keyof typeof this.plantilla.configuracion];
        if (config) {
            config.x = Math.max(0, this.fieldStartX + deltaX);
            config.y = Math.max(0, this.fieldStartY + deltaY);

            // Limit to canvas bounds (approximate)
            if (this.canvasContainer) {
                const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
                // Optional: Add boundary content checks here
            }
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
            await this.mostrarToast('Error al guardar plantilla', 'danger');
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
