import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonGrid, IonRow, IonCol, IonIcon,
    IonSpinner, IonText, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    peopleOutline, calendarOutline, documentTextOutline,
    trendingUpOutline, checkmarkCircleOutline, timeOutline,
    statsChartOutline, schoolOutline, ribbonOutline,
    arrowUpOutline, arrowDownOutline, playOutline,
    checkmarkDoneOutline
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { ReportesService, DashboardStats } from './services/reportes.service';
import { LoadingController, ToastController } from '@ionic/angular/standalone';

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
        CommonModule,
        IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
        IonMenuButton, IonGrid, IonRow, IonCol, IonIcon,
        IonSpinner, IonText, IonBadge,
        KpiCardComponent, TrendChartComponent, RolesChartComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportesPage implements OnInit {
    stats = signal<DashboardStats | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);

    private loadingController = inject(LoadingController);
    private toastController = inject(ToastController);

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
            'checkmark-done-outline': checkmarkDoneOutline
        });
    }

    ngOnInit() {
        this.loadStats();
    }

    async loadStats() {
        this.loading.set(true);
        this.error.set(null);

        try {
            const response = await firstValueFrom(this.reportesService.getDashboardStats());
            this.stats.set(response.data);
        } catch (err) {
            console.error('Error loading stats:', err);
            this.error.set('Error al cargar las estadísticas');
        } finally {
            this.loading.set(false);
        }
    }

    async exportarPDF() {
        const loading = await this.loadingController.create({
            message: 'Generando reporte PDF...',
            spinner: 'crescent'
        });
        await loading.present();

        try {
            const blob = await firstValueFrom(this.reportesService.exportDashboardPDF());
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
