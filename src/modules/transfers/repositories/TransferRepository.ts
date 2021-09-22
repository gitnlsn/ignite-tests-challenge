import { getRepository, Repository } from "typeorm";
import { Transfer } from "../entities/transfers";
import { ICreateTransferOperationDTO } from "../useCases/createTransfer/CreateTransferUseCase";
import { ITransfersRepository, IGetBalanceDTO } from "./ITransferRepository";

export class TransfersRepository implements ITransfersRepository {
    private repository: Repository<Transfer>;

    constructor() {
        this.repository = getRepository(Transfer);
    }

    async create({ sender_id, receiver_id, amount, description }: ICreateTransferOperationDTO): Promise<Transfer> {
        const transfer = this.repository.create({
            sender_id,
            receiver_id,
            amount,
            description
        });

        return this.repository.save(transfer);
    };

    async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
        Promise<
            { balance: number; } | { balance: number; statement: Transfer[]; }
        > {
        const transfersSent = await this.repository.find({
            where: { sender_id: user_id }
        });

        const transfersReceived = await this.repository.find({
            where: { receiver_id: user_id }
        });

        const balanceSent = transfersSent.reduce((acc, operation) => {
            return acc + Number(operation.amount);
        }, 0);

        const balanceReceived = transfersReceived.reduce((acc, operation) => {
            return acc + Number(operation.amount);
        }, 0);

        if (with_statement) {
            return {
                statement: [...transfersReceived, ...transfersSent],
                balance: balanceReceived - balanceSent
            }
        }

        return { balance: balanceReceived - balanceSent }
    }
}