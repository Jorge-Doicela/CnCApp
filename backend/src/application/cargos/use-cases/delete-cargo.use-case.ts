import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

@injectable()
export class DeleteCargoUseCase {
    constructor(
        @inject('PrismaClient') private readonly prisma: PrismaClient
    ) { }

    async execute(id: number) {
        return this.prisma.cargo.delete({
            where: { id }
        });
    }
}
