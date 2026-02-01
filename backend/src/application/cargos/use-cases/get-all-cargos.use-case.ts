import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

@injectable()
export class GetAllCargosUseCase {
    constructor(
        @inject('PrismaClient') private readonly prisma: PrismaClient
    ) { }

    async execute() {
        return this.prisma.cargo.findMany({
            orderBy: { nombre: 'asc' }
        });
    }
}
