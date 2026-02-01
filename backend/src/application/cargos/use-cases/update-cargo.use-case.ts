import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

@injectable()
export class UpdateCargoUseCase {
    constructor(
        @inject('PrismaClient') private readonly prisma: PrismaClient
    ) { }

    async execute(id: number, nombre: string) {
        return this.prisma.cargo.update({
            where: { id },
            data: { nombre }
        });
    }
}
