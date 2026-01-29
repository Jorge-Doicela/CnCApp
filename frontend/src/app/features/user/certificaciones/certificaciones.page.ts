import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-certificaciones',
    templateUrl: './certificaciones.page.html',
    styleUrls: ['./certificaciones.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule]
})
export class CertificacionesPage implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
