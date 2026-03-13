import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
    selector: 'app-kpi-card',
    template: `
        <div class="kpi-card" [ngClass]="type">
            <div class="card-glass-reveal"></div>
            <div class="card-icon">
                <ion-icon [name]="icon"></ion-icon>
            </div>
            <div class="card-data">
                <span class="label">{{ label }}</span>
                <h2 class="value">{{ value }}</h2>
                <div class="trend-wrapper" *ngIf="trendText">
                    <span class="trend" [ngClass]="{'positive': trendPositive}">
                        <ion-icon [name]="trendIcon"></ion-icon>
                        {{ trendText }}
                    </span>
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
            padding: 1.75rem 2rem;
            min-height: 130px;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            gap: 1.5rem;
            overflow: hidden;

            &:hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 25px 60px -15px rgba(31, 38, 135, 0.15);
                background: rgba(255, 255, 255, 0.9);
                border-color: rgba(255, 255, 255, 0.9);

                .card-icon {
                    transform: scale(1.1) rotate(5deg);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
            }
        }

        .card-icon {
            position: relative;
            z-index: 1;
            width: 70px;
            height: 70px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            flex-shrink: 0;
            background: #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .card-data {
            position: relative;
            z-index: 1;
            flex: 1;

            .label {
                display: block;
                font-size: 0.75rem;
                font-weight: 800;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin-bottom: 6px;
                opacity: 0.8;
            }
            .value {
                font-size: 2.25rem;
                font-weight: 950;
                color: #0f172a;
                margin: 0;
                line-height: 1.1;
                letter-spacing: -0.05em;
            }
            .trend-wrapper {
                margin-top: 10px;
                display: flex;
            }
            .trend {
                display: flex;
                align-items: center;
                gap: 0.35rem;
                font-size: 0.8rem;
                font-weight: 700;
                color: #94a3b8;
                padding: 5px 12px;
                background: #f1f5f9;
                border-radius: 100px;
                &.positive { 
                    color: #0d9488; 
                    background: #f0fdf4;
                }
            }
        }

        .primary .card-icon { color: var(--ion-color-primary); background: rgba(30, 58, 138, 0.08); }
        .success .card-icon { color: var(--ion-color-success); background: rgba(16, 185, 129, 0.08); }
        .warning .card-icon { color: var(--ion-color-warning); background: rgba(245, 158, 11, 0.08); }
        .info .card-icon { color: var(--ion-color-secondary); background: rgba(37, 99, 235, 0.08); }
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
