export interface Capacitacion {
    id: number;
    nombre: string;
    descripcion?: string | null;
    fechaInicio?: Date | null;
    fechaFin?: Date | null;
    lugar?: string | null;
    cuposDisponibles: number;
    modalidad?: string | null;
    estado: string;
    createdAt: Date;
}
