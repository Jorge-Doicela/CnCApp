export interface InstitucionRepository {
    findAll(): Promise<any[]>;
    findById(id: number): Promise<any | null>;
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<boolean>;
}
