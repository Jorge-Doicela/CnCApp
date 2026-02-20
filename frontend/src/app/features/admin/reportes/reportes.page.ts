import { Component, OnInit, signal } from '@angular/core';
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
import { ReportesService, DashboardStats } from './services/reportes.service';

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
    ]
})
export class ReportesPage implements OnInit {
    stats = signal<DashboardStats | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);

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

    loadStats() {
        this.loading.set(true);
        this.error.set(null);

        this.reportesService.getDashboardStats().subscribe({
            next: (response) => {
                this.stats.set(response.data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading stats:', err);
                this.error.set('Error al cargar las estadísticas');
                this.loading.set(false);
            }
        });
    }
}
