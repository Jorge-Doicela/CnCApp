
export interface PlantillaConfig {
    nombreUsuario: { x: number, y: number, fontSize: number, color: string };
    curso: { x: number, y: number, fontSize: number, color: string };
    fecha: { x: number, y: number, fontSize: number, color: string };
    cedula?: { x: number, y: number, fontSize: number, color: string };
    rol?: { x: number, y: number, fontSize: number, color: string };
    horas?: { x: number, y: number, fontSize: number, color: string };
}

export class Plantilla {
    constructor(
        public id: number,
        public nombre: string,
        public imagenUrl: string,
        public configuracion: PlantillaConfig | any, // Using any for flexibility with JSON
        public activa: boolean,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }
}
