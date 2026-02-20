export interface Canton {
    id: number;
    Id_Canton?: number; // Prisma mapping
    Nombre_Canton?: string; // Prisma mapping
    nombre_canton: string;
    codigo_canton: string;
    codigo_provincia: string;
    Id_Provincia?: number; // Prisma mapping
    estado: boolean;
    Estado?: boolean; // Casing inconsistency fix
    nombre_provincia?: string;
    notas?: string;
}
