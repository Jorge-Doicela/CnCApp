export interface RegisterUserDto {
    ci: string;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    email: string;
    password: string;
    telefono?: string;
    celular?: string;
    generoId?: number;
    etniaId?: number;
    nacionalidadId?: number;
    autoridad?: any;
    funcionarioGad?: any;
    institucion?: any;
    fechaNacimiento?: string; // ISO string
    provinciaId?: number;
    cantonId?: number;
    tipoParticipanteId?: number;
    rolId?: number;
    // captchaToken?: string; // --- GOOGLE RECAPTCHA (Descomentar en Producción) ---
}

export interface LoginUserDto {
    ci: string;
    password: string;
}

export interface AuthResponseDto {
    user: any;
    token: string;
}
