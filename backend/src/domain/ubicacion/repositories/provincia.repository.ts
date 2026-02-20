export interface ProvinciaRepository {
    findAll(): Promise<any[]>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<void>;
}
