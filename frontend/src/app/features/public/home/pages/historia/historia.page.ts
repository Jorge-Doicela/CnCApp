import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-historia',
  templateUrl: './historia.page.html',
  styleUrls: ['./historia.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HistoriaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  // Método para abrir documentos históricos (podría expandirse según necesidades)
  abrirDocumento(url: string) {
    window.open(url, '_blank');
  }
}
