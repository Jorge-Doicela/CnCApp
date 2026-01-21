import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-crudcargosinstituciones',
  templateUrl: './crudcargosinstituciones.page.html',
  styleUrls: ['./crudcargosinstituciones.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CrudcargosinstitucionesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
