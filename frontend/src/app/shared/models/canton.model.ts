export interface Canton {
    id: number;
    Id_Canton?: number; // Prisma mapping
    Nombre_Canton?: string; // Prisma mapping
    nombre: string;
    nombre_canton?: string;
    codigo_canton?: string;
    codigo_provincia: string;
    Id_Provincia?: number; // Prisma mapping
    provinciaId?: number; // Prisma mapping based on actual API
    estado?: boolean;
    Estado?: boolean; // Casing inconsistency fix
    nombre_provincia?: string;
    notas?: string;
}
