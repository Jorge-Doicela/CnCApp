export interface User {
    id: number;
    authUid?: string | null;
    nombre: string;
    ci: string;
    email?: string | null;
    telefono?: string | null;
    password?: string;
    tipoParticipante: number;
    rolId?: number | null;
    entidadId?: number | null;
    fotoPerfilUrl?: string | null;
    firmaUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    rol?: {
        id: number;
        nombre: string;
        modulos?: any;
    } | null;
    entidad?: {
         id: number;
         nombre: string;
    } | null;
}
