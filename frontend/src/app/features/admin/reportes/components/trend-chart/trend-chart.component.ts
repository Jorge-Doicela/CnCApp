import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexStroke, ApexYAxis, ApexGrid, ApexTooltip, ApexFill } from 'ng-apexcharts';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    stroke: ApexStroke;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    tooltip: ApexTooltip;
    colors: string[];
    fill: ApexFill;
};

@Component({
    selector: 'app-trend-chart',
    template: `
        <div class="chart-card">
            <div class="card-header">
                <h3>{{ title }}</h3>
                <p>{{ subtitle }}</p>
            </div>
            <div class="chart-container" *ngIf="chartOptions">
                <apx-chart
                    [series]="chartOptions.series"
                    [chart]="chartOptions.chart"
                    [xaxis]="chartOptions.xaxis"
                    [colors]="chartOptions.colors"
                    [dataLabels]="chartOptions.dataLabels"
                    [stroke]="chartOptions.stroke"
                    [fill]="chartOptions.fill"
                    [yaxis]="chartOptions.yaxis"
                    [grid]="chartOptions.grid"
                    [tooltip]="chartOptions.tooltip"
                ></apx-chart>
            </div>
        </div>
    `,
    styles: [`
        .chart-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            padding: 2rem;
            height: 100%;
        }
        .card-header {
            margin-bottom: 1.5rem;
            h3 { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; }
            p { font-size: 0.875rem; color: #64748b; margin: 0.25rem 0 0 0; }
        }
        .chart-container { min-height: 350px; }
    `],
    standalone: true,
    imports: [CommonModule, NgApexchartsModule]
})
export class TrendChartComponent implements OnChanges {
    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() data: { mes: string; usuarios: number; certificados: number; }[] = [];

    public chartOptions?: ChartOptions;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && this.data && this.data.length > 0) {
            this.initChart();
        }
    }

    private initChart() {
        this.chartOptions = {
            series: [
                {
                    name: "Usuarios",
                    data: this.data.map(t => t.usuarios)
                },
                {
                    name: "Certificados",
                    data: this.data.map(t => t.certificados)
                }
            ],
            chart: {
                height: 350,
                type: "area",
                toolbar: { show: false },
                zoom: { enabled: false },
                foreColor: '#64748b',
                animations: { enabled: true, speed: 800 }
            },
            colors: ["#6366f1", "#10b981"],
            dataLabels: { enabled: false },
            stroke: { curve: "smooth", width: 3 },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [20, 100, 100, 100]
                }
            },
            xaxis: {
                categories: this.data.map(t => t.mes),
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: { stepSize: 1 },
            grid: {
                borderColor: "#e2e8f0",
                strokeDashArray: 4,
                padding: { left: 20 }
            },
            tooltip: { theme: 'light' }
        };
    }
}
