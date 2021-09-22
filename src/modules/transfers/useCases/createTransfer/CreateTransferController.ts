import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateTransferUseCase } from './CreateTransferUseCase';

export enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

export class CreateTransferController {
  async execute(request: Request, response: Response) {
    const { id: sender_id } = request.user;
    const { id: receiver_id } = request.params;
    const { amount, description } = request.body;

    const createStatement = container.resolve(CreateTransferUseCase);

    const statement = await createStatement.execute({
      receiver_id,
      sender_id,
      amount,
      description
    });

    return response.status(201).json(statement);
  }
}
