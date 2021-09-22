import { Transfer } from "../../entities/transfers";
import { ICreateTransferOperationDTO } from "../../useCases/createTransfer/CreateTransferUseCase";
import { ITransfersRepository, IGetBalanceDTO } from "../ITransferRepository";

export class InMemoryTransfersRepository implements ITransfersRepository {
    private transfers: Transfer[] = [];

    async create(data: ICreateTransferOperationDTO): Promise<Transfer> {
        const transfer = new Transfer();

        Object.assign(transfer, data);

        this.transfers.push(transfer);

        return transfer;
    }

    async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
        Promise<
            { balance: number } | { balance: number, statement: Transfer[] }
        > {
        const transfersSent = await this.transfers.filter(transfer => transfer.sender_id === user_id);

        const transfersReceived = await this.transfers.filter(transfer => transfer.receiver_id === user_id);

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
