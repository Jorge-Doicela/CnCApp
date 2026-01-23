
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
    genero: string;
    etnia: string;
    nacionalidad: string;
    fechaNacimiento: string;
    celular: string;
    telefono: string;

    // Step 4: Labor Info
    tipoParticipante?: number;

    // Step 5: Terms
    termsAccepted: boolean;
    captchaVerified: boolean;
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
    genero: '',
    etnia: '',
    nacionalidad: 'Ecuatoriana',
    fechaNacimiento: '',
    celular: '',
    telefono: '',
    tipoParticipante: undefined,
    termsAccepted: false,
    captchaVerified: false // In dev we might mock this
};

@Injectable({
    providedIn: 'root'
})
export class RegisterStateService {
    private state = signal<RegisterStateModel>(initialState);

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
        genero: this.state().genero,
        etnia: this.state().etnia,
        nacionalidad: this.state().nacionalidad,
        fechaNacimiento: this.state().fechaNacimiento,
        celular: this.state().celular,
        telefono: this.state().telefono
    }));

    laborData = computed(() => ({
        tipoParticipante: this.state().tipoParticipante
    }));

    termsData = computed(() => ({
        termsAccepted: this.state().termsAccepted,
        captchaVerified: this.state().captchaVerified
    }));

    // Actions
    setStep(step: number) {
        this.state.update(s => ({ ...s, step }));
    }

    nextStep() {
        this.state.update(s => ({ ...s, step: s.step + 1 }));
    }

    prevStep() {
        this.state.update(s => ({ ...s, step: Math.max(1, s.step - 1) }));
    }

    updateUserData(data: Partial<RegisterStateModel>) {
        this.state.update(s => ({ ...s, ...data }));
    }

    reset() {
        this.state.set(initialState);
    }
}
