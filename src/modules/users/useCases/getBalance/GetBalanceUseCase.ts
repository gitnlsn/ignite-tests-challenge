import { inject, injectable } from "tsyringe";
import { ITransfersRepository } from "../../../transfers/repositories/ITransferRepository";

import { IUsersRepository } from "../../repositories/IUsersRepository";
import { Statement } from "../../../statements/entities/Statement";
import { IStatementsRepository } from "../../../statements/repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";

interface IRequest {
  user_id: string;
}

interface IResponse {
  statement: Statement[];
  balance: number;
}

@injectable()
export class GetBalanceUseCase {
  constructor(
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('TransfersRepository')
    private transfersRepository: ITransfersRepository,
  ) {}

  async execute({ user_id }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findById(user_id);

    if(!user) {
      throw new GetBalanceError();
    }

    const statementBalance = await this.statementsRepository.getUserBalance({
      user_id,
      with_statement: true
    }) as IResponse;

    const transferBalance = await this.transfersRepository.getUserBalance({
      user_id,
      with_statement: true
    }) as IResponse;

    return {
      statement: [...statementBalance.statement, ...transferBalance.statement],
      balance: statementBalance.balance + transferBalance.balance
    } as IResponse;
  }
}
