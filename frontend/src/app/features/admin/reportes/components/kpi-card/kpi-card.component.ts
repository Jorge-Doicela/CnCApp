import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTooltip,
  ApexFill,
  ApexTheme,
  NgApexchartsModule
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  theme: ApexTheme;
};

@Component({
    selector: 'app-kpi-card',
    template: `
        <div class="kpi-card" [ngClass]="type">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-icon">
                        <ion-icon [name]="icon"></ion-icon>
                    </div>
                    <div class="card-data">
                        <span class="label">{{ label }}</span>
                        <h2 class="value">{{ value }}</h2>
                    </div>
                </div>
                
                <div class="card-footer">
                    <div class="footer-info">
                        <div class="trend-wrapper" *ngIf="trendText">
                            <span class="trend" [ngClass]="{'positive': trendPositive}">
                                <ion-icon [name]="trendIcon"></ion-icon>
                                {{ trendText }}
                            </span>
                        </div>
                        <div class="detail-wrapper" *ngIf="detailText">
                            <span class="detail-badge">
                                <ion-icon name="time-outline" class="detail-icon"></ion-icon>
                                {{ detailText }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="micro-chart" *ngIf="chartData && chartData.length > 0">
                        <apx-chart
                            [series]="chartOptions.series"
                            [chart]="chartOptions.chart"
                            [stroke]="chartOptions.stroke"
                            [fill]="chartOptions.fill"
                            [tooltip]="chartOptions.tooltip"
                            [xaxis]="chartOptions.xaxis"
                            [yaxis]="chartOptions.yaxis"
                            [colors]="chartOptions.colors"
                            [markers]="chartOptions.markers"
                            [dataLabels]="chartOptions.dataLabels">
                        </apx-chart>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./kpi-card.component.scss'],
    standalone: true,
    imports: [CommonModule, IonIcon, NgApexchartsModule]
})
export class KpiCardComponent {
    @Input() label: string = '';
    @Input() value: string | number = 0;
    @Input() icon: string = '';
    @Input() type: 'primary' | 'success' | 'warning' | 'info' = 'primary';
    @Input() trendText: string = '';
    @Input() trendIcon: string = 'stats-chart-outline';
    @Input() trendPositive: boolean = false;
    @Input() chartData: number[] = [];
    @Input() detailText: string = ''; // New: details like "8 activas"

    public chartOptions: any;

    constructor() {
        this.initChartOptions();
    }

    ngOnChanges() {
        this.updateChartData();
    }

    private initChartOptions() {
        this.chartOptions = {
            series: [{ name: '', data: [] }],
            chart: {
                type: "area",
                height: 50,
                sparkline: { enabled: true },
                animations: { 
                    enabled: true, 
                    easing: 'easeinout',
                    speed: 1000,
                    animateGradually: { enabled: true, delay: 150 },
                    dynamicAnimation: { enabled: true, speed: 350 }
                },
                toolbar: { show: false }
            },
            colors: [this.getChartColor()],
            stroke: {
                curve: "smooth",
                width: 3,
                lineCap: 'round'
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.5,
                    opacityTo: 0,
                    stops: [0, 90, 100]
                }
            },
            markers: {
                size: 0,
                hover: { size: 5 }
            },
            tooltip: {
                enabled: true,
                fixed: { enabled: false },
                x: { show: false },
                y: { title: { formatter: () => '' } },
                marker: { show: false }
            },
            xaxis: { crosshairs: { show: false } },
            yaxis: { show: false },
            dataLabels: { enabled: false },
            theme: { mode: 'light' }
        };
    }

    private updateChartData() {
        if (this.chartOptions) {
            this.chartOptions.colors = [this.getChartColor()];
            this.chartOptions.series = [{
                name: this.label,
                data: this.chartData
            }];
        }
    }

    private getChartColor(): string {
        switch(this.type) {
            case 'success': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'info': return '#3b82f6';
            case 'primary': 
            default: return '#6366f1';
        }
    }
}
