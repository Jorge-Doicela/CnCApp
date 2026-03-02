
import { Injectable, signal, computed } from '@angular/core';

export interface RegisterStateModel {
    // Step 1: Welcome
    step: number;

    // Step 2: User Info
    ci: string;
    email: string;
    password: string;
    passwordConfirm: string;
    provinciaId?: number;
    cantonId?: number;

    // Step 3: Personal Info
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    generoId?: number;
    etniaId?: number;
    nacionalidad: string;
    fechaNacimiento: string;
    celular: string;
    telefono: string;

    // Step 4: Labor Info
    tipoParticipanteId?: number;

    // Step 5: Terms
    termsAccepted: boolean;
    captchaVerified: boolean;
    // captchaToken?: string; // --- GOOGLE RECAPTCHA (Descomentar en Producción) ---
}

const initialState: RegisterStateModel = {
    step: 1,
    ci: '',
    email: '',
    password: '',
    passwordConfirm: '',
    provinciaId: undefined,
    cantonId: undefined,
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    generoId: undefined,
    etniaId: undefined,
    nacionalidad: 'Ecuatoriana',
    fechaNacimiento: '',
    celular: '',
    telefono: '',
    tipoParticipanteId: undefined,
    termsAccepted: false,
    captchaVerified: false, // In dev we might mock this
    // captchaToken: undefined // --- GOOGLE RECAPTCHA (Descomentar en Producción) ---
};

@Injectable({
    providedIn: 'root'
})
export class RegisterStateService {
    private state = signal<RegisterStateModel>(initialState);

    constructor() {
        const saved = sessionStorage.getItem('cnc_register_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state.set({ ...initialState, ...parsed });
            } catch (e) {
                console.error('Error parsing saved register state', e);
            }
        }
    }

    private saveState(newState: RegisterStateModel) {
        // Guardamos todo excepto contraseñas por seguridad
        const { password, passwordConfirm, ...safeState } = newState;
        sessionStorage.setItem('cnc_register_state', JSON.stringify(safeState));
    }

    // Selectors
    step = computed(() => this.state().step);
    formValid = computed(() => {
        const s = this.state();
        // Basic overall validation logic could go here or per-step
        return true;
    });

    // Data selectors
    userData = computed(() => ({
        ci: this.state().ci,
        email: this.state().email,
        password: this.state().password,
        passwordConfirm: this.state().passwordConfirm,
        provinciaId: this.state().provinciaId,
        cantonId: this.state().cantonId
    }));

    personalData = computed(() => ({
        primerNombre: this.state().primerNombre,
        segundoNombre: this.state().segundoNombre,
        primerApellido: this.state().primerApellido,
        segundoApellido: this.state().segundoApellido,
        generoId: this.state().generoId,
        etniaId: this.state().etniaId,
        nacionalidad: this.state().nacionalidad,
        fechaNacimiento: this.state().fechaNacimiento,
        celular: this.state().celular,
        telefono: this.state().telefono
    }));

    laborData = computed(() => ({
        tipoParticipanteId: this.state().tipoParticipanteId
    }));

    termsData = computed(() => ({
        termsAccepted: this.state().termsAccepted,
        captchaVerified: this.state().captchaVerified,
        // captchaToken: this.state().captchaToken // --- GOOGLE RECAPTCHA (Descomentar en Producción) ---
    }));

    // Actions
    setStep(step: number) {
        this.state.update(s => {
            const newState = { ...s, step };
            this.saveState(newState);
            return newState;
        });
    }

    nextStep() {
        this.state.update(s => {
            const newState = { ...s, step: s.step + 1 };
            this.saveState(newState);
            return newState;
        });
    }

    prevStep() {
        this.state.update(s => {
            const newState = { ...s, step: Math.max(1, s.step - 1) };
            this.saveState(newState);
            return newState;
        });
    }

    updateUserData(data: Partial<RegisterStateModel>) {
        this.state.update(s => {
            const newState = { ...s, ...data };
            this.saveState(newState);
            return newState;
        });
    }

    reset() {
        sessionStorage.removeItem('cnc_register_state');
        this.state.set(initialState);
    }
}
