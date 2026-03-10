export interface User {
    id: number;
    authUid?: string | null;
    nombre: string;
    ci: string;
    email?: string | null;
    telefono?: string | null;
    password?: string;
    tipoParticipanteId?: number | null;
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
    generoId?: number | null;
    etniaId?: number | null;
    nacionalidadId?: number | null;
    fechaNacimiento?: Date | null;
    provinciaId?: number | null;
    cantonId?: number | null;
    parroquiaId?: number | null;
    estado: number;
    provincia?: {
        id: number;
        nombre: string;
    } | null;
    canton?: {
        id: number;
        nombre: string;
    } | null;
    parroquia?: {
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
    tipoParticipante?: {
        id: number;
        nombre: string;
    } | null;
    genero?: {
        id: number;
        nombre: string;
    } | null;
    etnia?: {
        id: number;
        nombre: string;
    } | null;
    nacionalidad?: {
        id: number;
        nombre: string;
    } | null;
    _count?: {
        inscripciones: number;
        certificados: number;
    } | null;
    autoridad?: any;
    funcionarioGad?: any;
    institucion?: any;
}
