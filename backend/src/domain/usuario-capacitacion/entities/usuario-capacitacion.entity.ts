export interface UsuarioCapacitacion {
    id: number;
    usuarioId: number;
    capacitacionId: number;
    rolCapacitacion: string;
    fechaInscripcion: Date;
    estadoInscripcion: string;
    asistio: boolean;
    usuario?: {
        id: number;
        nombre: string;
        email?: string | null;
        fotoPerfilUrl?: string | null;
    };
    capacitacion?: {
        id: number;
        nombre: string;
        fechaInicio?: Date | null;
        lugar?: string | null;
        estado: string;
        certificado?: boolean;
    };
}
