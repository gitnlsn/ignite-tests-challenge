import { Transfer } from "../entities/transfers";
import { ICreateTransferOperationDTO } from "../useCases/createTransfer/CreateTransferUseCase";

export interface IGetBalanceDTO {
  user_id: string;
  with_statement?: boolean;
}

export interface ITransfersRepository {
  create: (data: ICreateTransferOperationDTO) => Promise<Transfer>;
  getUserBalance: (data: IGetBalanceDTO) => Promise<
    { balance: number } | { balance: number, statement: Transfer[] }
  >;
}
