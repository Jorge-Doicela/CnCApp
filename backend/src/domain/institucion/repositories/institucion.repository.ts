export interface InstitucionRepository {
    findAll(): Promise<any[]>;
    findById(id: number): Promise<any | null>;
}
