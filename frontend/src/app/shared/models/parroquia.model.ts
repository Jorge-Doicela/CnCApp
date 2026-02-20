export interface Parroquia {
    Id_Parroquia: number;
    Nombre_Parroquia: string;
    Id_Canton: number;
    Estado?: boolean; // Note: Prisma schema didn't have Estado, but frontend uses it. 
    // If it's not in DB, I'll need to check if I should add it or if frontend uses it purely locally.
    // Actually, I'll match the usage in the existing page.
    codigo_parroquia: string;
    codigo_canton: string;
    nombre_parroquia: string;
    nombre_canton?: string;
    estado: boolean;
}
