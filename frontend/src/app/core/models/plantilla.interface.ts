
export interface PlantillaCertificado {
    id: number;
    nombre: string;
    imagenUrl: string;
    configuracion: {
        nombreUsuario: { x: number, y: number, fontSize: number, color: string };
        curso: { x: number, y: number, fontSize: number, color: string };
        fecha: { x: number, y: number, fontSize: number, color: string };
        cedula?: { x: number, y: number, fontSize: number, color: string };
        rol?: { x: number, y: number, fontSize: number, color: string };
        horas?: { x: number, y: number, fontSize: number, color: string };
    };
    activa: boolean;
    createdAt?: string;
    updatedAt?: string;
}
