import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonGrid, IonRow, IonCol, IonIcon,
    IonSpinner, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    peopleOutline, calendarOutline, documentTextOutline,
    trendingUpOutline, checkmarkCircleOutline, timeOutline
} from 'ionicons/icons';
import { ReportesService, DashboardStats } from './services/reportes.service';

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.page.html',
    styleUrls: ['./reportes.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
        IonMenuButton, IonCard, IonCardHeader, IonCardTitle,
        IonCardContent, IonGrid, IonRow, IonCol, IonIcon,
        IonSpinner, IonText
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
            'time-outline': timeOutline
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
