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
            border-radius: 24px;
            box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.08);
            padding: 1.5rem;
            height: 100%;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            gap: 1.25rem;
            overflow: hidden;

            &:hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 20px 60px -15px rgba(31, 38, 135, 0.15);
                background: rgba(255, 255, 255, 0.85);
                border-color: rgba(255, 255, 255, 0.8);

                .card-glass-reveal {
                    opacity: 1;
                    transform: scale(2);
                }

                .card-icon {
                    transform: scale(1.1) rotate(5deg);
                }
            }
        }

        .card-glass-reveal {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
            opacity: 0;
            transition: all 0.8s ease;
            pointer-events: none;
            z-index: 0;
        }

        .card-icon {
            position: relative;
            z-index: 1;
            width: 64px;
            height: 64px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            flex-shrink: 0;
            background: #f8fafc;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .card-data {
            position: relative;
            z-index: 1;
            flex: 1;

            .label {
                display: block;
                font-size: 0.7rem;
                font-weight: 800;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin-bottom: 4px;
            }
            .value {
                font-size: 2rem;
                font-weight: 950;
                color: #0f172a;
                margin: 0;
                line-height: 1;
                letter-spacing: -0.04em;
            }
            .trend-wrapper {
                margin-top: 8px;
                display: flex;
            }
            .trend {
                display: flex;
                align-items: center;
                gap: 0.25rem;
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
