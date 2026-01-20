import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.page.html',
  styleUrls: ['./informacion.page.scss'],
  standalone: false
})
export class InformacionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  // Método para abrir documentos adicionales
  abrirDocumento(url: string) {
    window.open(url, '_blank');
  }

  // Método para mostrar más información sobre un miembro del consejo
  verDetalleMiembro(id: number) {
    // Esta función podría expandirse para mostrar un modal con más información
    console.log('Ver detalles del miembro:', id);
  }
}
