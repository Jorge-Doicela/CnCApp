export interface ParroquiaRepository {
    findAll(): Promise<any[]>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<void>;
}
