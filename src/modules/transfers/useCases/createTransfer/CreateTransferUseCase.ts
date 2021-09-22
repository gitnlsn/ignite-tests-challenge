import { inject, injectable } from "tsyringe";
import { IStatementsRepository } from "../../../statements/repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Transfer } from "../../entities/transfers";
import { ITransfersRepository } from "../../repositories/ITransferRepository";
import { CreateTransferError } from "./CreateTransferError";

export type ICreateTransferOperationDTO = Pick<
    Transfer,
    'sender_id' |
    'receiver_id' |
    'description' |
    'amount'
>

@injectable()
export class CreateTransferUseCase {
    constructor(
        @inject('UsersRepository')
        private usersRepository: IUsersRepository,

        @inject("TransfersRepository")
        private transfersRepository: ITransfersRepository,
        
        @inject("StatementsRepository")
        private statementsRepository: IStatementsRepository
    ) { }

    async execute({ receiver_id, sender_id, amount, description }: ICreateTransferOperationDTO) {
        const receiver = await this.usersRepository.findById(receiver_id);
        const sender = await this.usersRepository.findById(sender_id);

        if (!receiver || !sender) {
            throw new CreateTransferError.UserNotFound();
        }

        const { balance: transfersBalance } = await this.transfersRepository.getUserBalance({ user_id: sender_id });
        const { balance: statementsBalance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

        if (transfersBalance + statementsBalance < amount) {
            throw new CreateTransferError.InsufficientFunds();
        }

        const transferOperation = await this.transfersRepository.create({
            sender_id,
            receiver_id,
            amount,
            description
        });

        return transferOperation;
    }
}
