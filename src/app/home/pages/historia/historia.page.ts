import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-historia',
  templateUrl: './historia.page.html',
  styleUrls: ['./historia.page.scss'],
  standalone: false
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
