import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
    selector: 'app-kpi-card',
    template: `
        <div class="kpi-card" [ngClass]="type">
            <div class="card-icon">
                <ion-icon [name]="icon"></ion-icon>
            </div>
            <div class="card-data">
                <span class="label">{{ label }}</span>
                <h2 class="value">{{ value }}</h2>
                <span class="trend" [ngClass]="{'positive': trendPositive}">
                    <ion-icon [name]="trendIcon"></ion-icon>
                    {{ trendText }}
                </span>
            </div>
        </div>
    `,
    styles: [`
        .kpi-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            padding: 1.5rem;
            height: 100%;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 1.25rem;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                border-color: #cbd5e1;
            }
        }

        .card-icon {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
            background: #f1f5f9;
        }

        .card-data {
            .label {
                display: block;
                font-size: 0.75rem;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 4px;
            }
            .value {
                font-size: 1.75rem;
                font-weight: 800;
                color: #0f172a;
                margin: 0;
                line-height: 1.2;
            }
            .trend {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.8rem;
                font-weight: 600;
                color: #94a3b8;
                margin-top: 4px;
                &.positive { color: #10b981; }
            }
        }

        .primary .card-icon { color: #6366f1; }
        .success .card-icon { color: #10b981; }
        .warning .card-icon { color: #f59e0b; }
        .info .card-icon { color: #3b82f6; }
    `],
    standalone: true,
    imports: [CommonModule, IonIcon]
})
export class KpiCardComponent {
    @Input() label: string = '';
    @Input() value: string | number = 0;
    @Input() icon: string = '';
    @Input() type: 'primary' | 'success' | 'warning' | 'info' = 'primary';
    @Input() trendText: string = '';
    @Input() trendIcon: string = 'stats-chart-outline';
    @Input() trendPositive: boolean = false;
}
