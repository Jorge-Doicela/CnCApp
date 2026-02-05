import { injectable, inject } from 'tsyringe';
import { CargoRepository } from '../../../domain/user/repositories/cargo.repository';

@injectable()
export class GetAllCargosUseCase {
    constructor(
        @inject('CargoRepository') private readonly cargoRepository: CargoRepository
    ) { }

    async execute() {
        return this.cargoRepository.findAll();
    }
}
