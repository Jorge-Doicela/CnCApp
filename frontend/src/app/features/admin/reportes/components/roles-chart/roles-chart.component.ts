import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexNonAxisChartSeries, ApexChart, ApexPlotOptions, ApexDataLabels, ApexLegend, ApexStroke } from 'ng-apexcharts';

export type RolesChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    colors: string[];
    legend: ApexLegend;
    plotOptions: ApexPlotOptions;
    dataLabels: ApexDataLabels;
    stroke: ApexStroke;
};

@Component({
    selector: 'app-roles-chart',
    template: `
        <div class="chart-card">
            <div class="card-header">
                <h3>{{ title }}</h3>
                <p>{{ subtitle }}</p>
            </div>
            <div class="chart-container donut-center" *ngIf="chartOptions">
                <apx-chart
                    [series]="chartOptions.series"
                    [chart]="chartOptions.chart"
                    [labels]="chartOptions.labels"
                    [colors]="chartOptions.colors"
                    [legend]="chartOptions.legend"
                    [plotOptions]="chartOptions.plotOptions"
                    [dataLabels]="chartOptions.dataLabels"
                    [stroke]="chartOptions.stroke"
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
        .chart-container { 
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `],
    standalone: true,
    imports: [CommonModule, NgApexchartsModule]
})
export class RolesChartComponent implements OnChanges {
    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() data: { nombre: string; cantidad: number; }[] = [];
    @Input() total: number = 0;

    public chartOptions?: RolesChartOptions;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && this.data && this.data.length > 0) {
            this.initChart();
        }
    }

    private initChart() {
        this.chartOptions = {
            series: this.data.map(r => r.cantidad),
            chart: {
                type: "donut",
                height: 300,
                foreColor: '#64748b',
                animations: { enabled: true, speed: 800 }
            },
            labels: this.data.map(r => r.nombre),
            colors: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
            legend: {
                position: "bottom",
                offsetY: 0
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: () => this.total.toString()
                            }
                        }
                    }
                }
            },
            dataLabels: { enabled: false },
            stroke: { show: false }
        };
    }
}
