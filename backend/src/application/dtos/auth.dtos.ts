export interface RegisterUserDto {
    nombre: string;
    ci: string;
    email?: string;
    telefono?: string;
    password: string;
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
