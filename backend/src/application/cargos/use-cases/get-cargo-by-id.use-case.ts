import { injectable, inject } from 'tsyringe';
import { CargoRepository } from '../../../domain/user/repositories/cargo.repository';

@injectable()
export class GetCargoByIdUseCase {
    constructor(
        @inject('CargoRepository') private cargoRepository: CargoRepository
    ) { }

    async execute(id: number): Promise<any | null> {
        return this.cargoRepository.findById(id);
    }
}
