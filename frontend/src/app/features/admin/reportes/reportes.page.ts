import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IonHeader, IonToolbar, IonContent, IonButtons,
    IonMenuButton, IonIcon,
    IonSpinner, IonButton, IonBadge, IonSelect, IonSelectOption,
    IonItem, IonLabel, IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    peopleOutline, calendarOutline, documentTextOutline,
    trendingUpOutline, checkmarkCircleOutline, timeOutline,
    statsChartOutline, schoolOutline, ribbonOutline,
    arrowUpOutline, arrowDownOutline, playOutline,
    checkmarkDoneOutline, downloadOutline, arrowBackOutline,
    mapOutline, podiumOutline, maleFemaleOutline,
    filterOutline, closeOutline, calendarClearOutline, businessOutline,
    refreshOutline
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { ReportesService, DashboardStats, DashboardFilter } from './services/reportes.service';
import { CatalogoService } from 'src/app/shared/services/catalogo.service';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

// Modular Components
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { TrendChartComponent } from './components/trend-chart/trend-chart.component';
import { RolesChartComponent } from './components/roles-chart/roles-chart.component';

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.page.html',
    styleUrls: ['./reportes.page.scss'],
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        IonHeader, IonToolbar, IonContent, IonButtons,
        IonMenuButton, IonIcon, IonBadge, IonSelect, IonSelectOption,
        IonItem, IonLabel, IonInput,
        IonSpinner, IonButton,
        KpiCardComponent, TrendChartComponent, RolesChartComponent,
        RouterModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportesPage implements OnInit {
    stats = signal<DashboardStats | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);
    
    // Filters
    entidades = signal<any[]>([]);
    filtros = signal<DashboardFilter>({
        startDate: '',
        endDate: '',
        entidadId: undefined,
        modalidad: ''
    });
    filtrosActivosCount = signal(0);

    private loadingController = inject(LoadingController);
    private toastController = inject(ToastController);
    private catalogoService = inject(CatalogoService);

    constructor(private reportesService: ReportesService) {
        addIcons({
            'people-outline': peopleOutline,
            'calendar-outline': calendarOutline,
            'document-text-outline': documentTextOutline,
            'trending-up-outline': trendingUpOutline,
            'checkmark-circle-outline': checkmarkCircleOutline,
            'time-outline': timeOutline,
            'stats-chart-outline': statsChartOutline,
            'school-outline': schoolOutline,
            'ribbon-outline': ribbonOutline,
            'arrow-up-outline': arrowUpOutline,
            'arrow-down-outline': arrowDownOutline,
            'play-outline': playOutline,
            'checkmark-done-outline': checkmarkDoneOutline,
            'arrow-back-outline': arrowBackOutline,
            'map-outline': mapOutline,
            'podium-outline': podiumOutline,
            'male-female-outline': maleFemaleOutline,
            'filter-outline': filterOutline,
            'close-outline': closeOutline,
            'calendar-clear-outline': calendarClearOutline,
            'business-outline': businessOutline,
            'refresh-outline': refreshOutline
        });
    }

    round(value: number): number {
        return Math.round(value);
    }

    ngOnInit() {
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            const ent = await firstValueFrom(this.catalogoService.getItems('entidades'));
            this.entidades.set(ent || []);
        } catch (err) {
            console.error('Error loading entities:', err);
        }
        this.loadStats();
    }

    actualizarFiltros() {
        let count = 0;
        const f = this.filtros();
        if (f.startDate) count++;
        if (f.endDate) count++;
        if (f.entidadId) count++;
        if (f.modalidad) count++;
        this.filtrosActivosCount.set(count);
        this.loadStats();
    }

    limpiarFiltros() {
        this.filtros.set({
            startDate: '',
            endDate: '',
            entidadId: undefined,
            modalidad: ''
        });
        this.filtrosActivosCount.set(0);
        this.loadStats();
    }

    async loadStats() {
        this.loading.set(true);
        this.error.set(null);

        try {
            const response = await firstValueFrom(this.reportesService.getDashboardStats(this.filtros()));
            this.stats.set(response.data);
        } catch (err) {
            console.error('Error loading stats:', err);
            this.error.set('Error al cargar las estadísticas');
        } finally {
            this.loading.set(false);
        }
    }

    getUsuariosTrends(): number[] {
        const stats = this.stats();
        if (!stats || !stats.tendencias) return [];
        return stats.tendencias.map(t => t.usuarios);
    }

    getCertificadosTrends(): number[] {
        const stats = this.stats();
        if (!stats || !stats.tendencias) return [];
        return stats.tendencias.map(t => t.certificados);
    }

    async exportarPDF() {
        const loading = await this.loadingController.create({
            message: 'Generando reporte PDF...',
            spinner: 'crescent'
        });
        await loading.present();

        try {
            const blob = await firstValueFrom(this.reportesService.exportDashboardPDF(this.filtros()));
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-dashboard-${new Date().getTime()}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting PDF:', err);
            this.error.set('Error al exportar el reporte PDF');
        } finally {
            loading.dismiss();
        }
    }
}
