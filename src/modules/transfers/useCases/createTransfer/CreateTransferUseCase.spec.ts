import { InMemoryStatementsRepository } from "../../../statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../../statements/repositories/IStatementsRepository";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryTransfersRepository } from "../../repositories/inMemory/InMemoryTransfersRepository";
import { ITransfersRepository } from "../../repositories/ITransferRepository";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("CreateStatementUseCase", () => {
    // InMemory repositories
    let statementsRepository: IStatementsRepository;
    let transfersRepository: ITransfersRepository;
    let usersRepository: IUsersRepository;

    // createstatementUseCase
    let createTransferUseCase: CreateTransferUseCase;

    let userData_receiver = {
        email: "userteste1@mail.com",
        name: "user name",
        password: "user password"
    };

    let userData_sender = {
        email: "userteste2@mail.com",
        name: "user name",
        password: "user password"
    };

    let user_receiver: User;
    let user_sender: User;

    beforeEach(async () => {
        statementsRepository = new InMemoryStatementsRepository();
        usersRepository = new InMemoryUsersRepository();
        transfersRepository = new InMemoryTransfersRepository();

        createTransferUseCase = new CreateTransferUseCase(
            usersRepository,
            transfersRepository,
            statementsRepository,
        );

        await usersRepository.create({
            email: userData_receiver.email,
            name: userData_receiver.name,
            password: userData_receiver.password
        });

        await usersRepository.create({
            email: userData_sender.email,
            name: userData_sender.name,
            password: userData_sender.password
        });

        user_receiver = await usersRepository.findByEmail(userData_receiver.email) as User;
        user_sender = await usersRepository.findByEmail(userData_sender.email) as User;

        await statementsRepository.create({
            user_id: user_receiver.id as string,
            amount: 1000,
            description: 'receiver first deposit',
            type: OperationType.DEPOSIT,
        });

        await statementsRepository.create({
            user_id: user_sender.id as string,
            amount: 1000,
            description: 'sender first deposit',
            type: OperationType.DEPOSIT,
        });
    });

    it('should allow transfer', async () => {
        const transfer = await createTransferUseCase.execute({
            sender_id: user_sender.id as string,
            receiver_id: user_receiver.id as string,
            amount: 500,
            description: 'first transfer'
        });

        expect(transfer).toHaveProperty('id');
        expect(transfer.amount).toBe(500);
        expect(transfer.sender_id).toBe(user_sender.id);
        expect(transfer.receiver_id).toBe(user_receiver.id);
        expect(transfer.description).toBe('first transfer');
    });

    it('should not allow transfer if not enough amount', () => {
        expect(async () => {
            await createTransferUseCase.execute({
                sender_id: user_sender.id as string,
                receiver_id: user_receiver.id as string,
                amount: 1500,
                description: 'first transfer'
            });
        }).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds);
    });
});