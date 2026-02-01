import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

@injectable()
export class CreateCargoUseCase {
    constructor(
        @inject('PrismaClient') private readonly prisma: PrismaClient
    ) { }

    async execute(nombre: string) {
        return this.prisma.cargo.create({
            data: { nombre }
        });
    }
}
