export interface Provincia {
    IdProvincia?: number; // Legacy or alternative mapping
    id: number; // Actual ID
    Codigo_Provincia?: string;
    Nombre_Provincia?: string;
    nombre: string; // Actual name
    Estado?: boolean;
    Fecha_Creacion?: string;
    Fecha_Modificacion?: string;
}
