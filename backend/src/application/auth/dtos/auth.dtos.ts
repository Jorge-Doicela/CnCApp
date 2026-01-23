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
    genero?: string;
    etnia?: string;
    nacionalidad?: string;
    fechaNacimiento?: string; // ISO string
    provinciaId?: number;
    cantonId?: number;
    tipoParticipante?: number;
    rolId?: number;
}

export interface LoginUserDto {
    ci: string;
    password: string;
}

export interface AuthResponseDto {
    user: any;
    token: string;
}
