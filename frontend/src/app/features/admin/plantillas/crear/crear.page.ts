import { Component, OnInit, ElementRef, ViewChild, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, LoadingController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PlantillasService, PlantillaCertificado } from '../services/plantillas.service';
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
    key: keyof PlantillaCertificado['configuracion'];
    label: string;
    enabled: boolean;
}

@Component({
    selector: 'app-crear-plantilla',
    templateUrl: './crear.page.html',
    styleUrls: ['./crear.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule]
})
export class CrearPage implements OnInit {
    @ViewChild('canvasContainer') canvasContainer!: ElementRef;

    isEdit = false;
    cargando = false;
    guardando = false;

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
        try {
            this.plantillasService.getPlantilla(id).subscribe({
                next: (plantilla) => {
                    if (plantilla) {
                        this.plantilla = JSON.parse(JSON.stringify(plantilla));
                        this.sincronizarCampos();
                    }
                    this.cargando = false;
                },
                error: (error) => {
                    console.error('Error al cargar plantilla:', error);
                    this.mostrarToast('Error al cargar plantilla', 'danger');
                    this.cargando = false;
                    this.navCtrl.navigateBack('/gestionar-plantillas');
                }
            });
        } catch (error) {
            console.error('Error inesperado:', error);
            this.cargando = false;
        }
    }

    sincronizarCampos() {
        // Enable fields that exist in configuration
        this.fields.forEach(field => {
            field.enabled = !!this.plantilla.configuracion[field.key];
        });
    }

    toggleField(field: DraggableField) {
        if (field.enabled) {
            // Add field to configuration
            if (!this.plantilla.configuracion[field.key]) {
                this.plantilla.configuracion[field.key] = {
                    x: 420,
                    y: 300,
                    fontSize: 16,
                    color: '#000000'
                };
            }
        } else {
            // Remove field from configuration
            delete this.plantilla.configuracion[field.key];
        }
    }

    getPlaceholder(key: string): string {
        const placeholders: Record<string, string> = {
            nombreUsuario: 'JUAN PÉREZ GARCÍA',
            curso: 'GESTIÓN DE COMPETENCIAS',
            fecha: '07/02/2026',
            cedula: '1234567890',
            rol: 'PARTICIPANTE',
            horas: '40 HORAS'
        };
        return placeholders[key] || 'TEXTO';
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
    startDrag(event: MouseEvent | TouchEvent, key: string) {
        event.preventDefault();
        this.activeDragKey = key;

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

        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

        const deltaX = clientX - this.dragStartX;
        const deltaY = clientY - this.dragStartY;

        const config = this.plantilla.configuracion[this.activeDragKey as keyof typeof this.plantilla.configuracion];
        if (config) {
            config.x = Math.max(0, this.fieldStartX + deltaX);
            config.y = Math.max(0, this.fieldStartY + deltaY);
        }
    }

    @HostListener('document:mouseup')
    @HostListener('document:touchend')
    onDragEnd() {
        this.activeDragKey = null;
    }

    updateField(key: string) {
        // Trigger change detection
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
        const loading = await this.loadingCtrl.create({
            message: 'Guardando plantilla...'
        });
        await loading.present();

        try {
            this.plantillasService.savePlantilla(this.plantilla).subscribe({
                next: async () => {
                    await loading.dismiss();
                    this.guardando = false;
                    await this.mostrarToast('Plantilla guardada correctamente', 'success');
                    this.navCtrl.navigateBack('/gestionar-plantillas');
                },
                error: async (error) => {
                    console.error('Error al guardar plantilla:', error);
                    await loading.dismiss();
                    this.guardando = false;
                    await this.mostrarToast('Error al guardar plantilla', 'danger');
                }
            });
        } catch (error) {
            console.error('Error inesperado:', error);
            await loading.dismiss();
            this.guardando = false;
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
