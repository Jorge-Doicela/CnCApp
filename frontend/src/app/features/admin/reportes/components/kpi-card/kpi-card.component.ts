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
                    <div class="trend-wrapper" *ngIf="trendText">
                        <span class="trend" [ngClass]="{'positive': trendPositive}">
                            <ion-icon [name]="trendIcon"></ion-icon>
                            {{ trendText }}
                        </span>
                    </div>
                    
                    <div class="micro-chart" *ngIf="chartData && chartData.length > 0">
                        <apx-chart
                            [series]="[{ name: label, data: chartData }]"
                            [chart]="chartOptions.chart"
                            [stroke]="chartOptions.stroke"
                            [fill]="chartOptions.fill"
                            [tooltip]="chartOptions.tooltip"
                            [xaxis]="chartOptions.xaxis"
                            [yaxis]="chartOptions.yaxis"
                            [dataLabels]="chartOptions.dataLabels">
                        </apx-chart>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .kpi-card {
            position: relative;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 28px;
            box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.08);
            padding: 1.5rem;
            min-height: 160px;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;

            &:hover {
                transform: translateY(-8px) scale(1.01);
                box-shadow: 0 25px 60px -15px rgba(31, 38, 135, 0.15);
                background: rgba(255, 255, 255, 0.9);
                border-color: rgba(255, 255, 255, 0.9);

                .card-icon {
                    transform: scale(1.05) rotate(3deg);
                }
            }
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            margin-bottom: 1rem;
        }

        .card-icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
            background: #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            transition: all 0.4s ease;
        }

        .card-data {
            .label {
                display: block;
                font-size: 0.7rem;
                font-weight: 800;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 2px;
                opacity: 0.8;
            }
            .value {
                font-size: 1.75rem;
                font-weight: 950;
                color: #0f172a;
                margin: 0;
                line-height: 1;
                letter-spacing: -0.04em;
            }
        }

        .card-footer {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 1rem;
            min-height: 45px;
        }

        .trend-wrapper {
            flex-shrink: 0;
        }

        .trend {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.75rem;
            font-weight: 700;
            color: #94a3b8;
            padding: 4px 10px;
            background: #f1f5f9;
            border-radius: 100px;
            &.positive { 
                color: #0d9488; 
                background: #f0fdf4;
            }
        }

        .micro-chart {
            flex: 1;
            max-width: 120px;
            height: 45px;
            margin-bottom: -10px;
            margin-right: -10px;

            apx-chart {
                min-height: 45px !important;
            }
        }

        .primary .card-icon { color: var(--ion-color-primary); background: rgba(var(--ion-color-primary-rgb), 0.1); }
        .success .card-icon { color: var(--ion-color-success); background: rgba(var(--ion-color-success-rgb), 0.1); }
        .warning .card-icon { color: var(--ion-color-warning); background: rgba(var(--ion-color-warning-rgb), 0.1); }
        .info .card-icon { color: var(--ion-color-secondary); background: rgba(var(--ion-color-secondary-rgb), 0.1); }
    `],
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

    public chartOptions: ChartOptions;

    constructor() {
        this.chartOptions = {
            series: [{ name: '', data: [] }],
            chart: {
                type: "area",
                height: 45,
                sparkline: { enabled: true },
                animations: { 
                    enabled: true, 
                    speed: 800,
                    dynamicAnimation: { enabled: true, speed: 350 }
                }
            },
            stroke: {
                curve: "smooth",
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [20, 100]
                }
            },
            tooltip: { enabled: false },
            xaxis: { crosshairs: { show: false } },
            yaxis: { show: false },
            dataLabels: { enabled: false },
            theme: { mode: 'light' }
        };
    }
}
