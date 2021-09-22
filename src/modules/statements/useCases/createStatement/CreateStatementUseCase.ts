import { inject, injectable } from "tsyringe";
import { ITransfersRepository } from "../../../transfers/repositories/ITransferRepository";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('TransfersRepository')
    private transfersRepository: ITransfersRepository
  ) {}

  async execute({ user_id, type, amount, description }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if(!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if(type === 'withdraw') {
      const { balance: statementsBalance } = await this.statementsRepository.getUserBalance({ user_id });
      const { balance: transfersBalance } = await this.transfersRepository.getUserBalance({ user_id });

      if (statementsBalance + transfersBalance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description
    });

    return statementOperation;
  }
}
