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
    // Extended profile fields
    primerNombre?: string | null;
    segundoNombre?: string | null;
    primerApellido?: string | null;
    segundoApellido?: string | null;
    celular?: string | null;
    genero?: string | null;
    etnia?: string | null;
    nacionalidad?: string | null;
    fechaNacimiento?: Date | null;
    provinciaId?: number | null;
    cantonId?: number | null;
    provincia?: {
        id: number;
        nombre: string;
    } | null;
    canton?: {
        id: number;
        nombre: string;
    } | null;
    rol?: {
        id: number;
        nombre: string;
        modulos?: any;
    } | null;
    entidad?: {
        id: number;
        nombre: string;
    } | null;
    _count?: {
        inscripciones: number;
        certificados: number;
    } | null;
}
