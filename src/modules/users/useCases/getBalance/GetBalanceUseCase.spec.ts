import { InMemoryTransfersRepository } from "../../../transfers/repositories/inMemory/InMemoryTransfersRepository";
import { ITransfersRepository } from "../../../transfers/repositories/ITransferRepository";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../../statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../../statements/repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("GetBalanceUseCase", () => {
    // InMemory repositories
    let statementsRepository: IStatementsRepository;
    let usersRepository: IUsersRepository;
    let transfersRepository: ITransfersRepository;

    // getBalanceUseCase
    let getBalanceUseCase: GetBalanceUseCase;

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

        getBalanceUseCase = new GetBalanceUseCase(
            statementsRepository,
            usersRepository,
            transfersRepository
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
            user_id: user_sender.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "description"
        });
            
        await statementsRepository.create({
            user_id: user_receiver.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "description"
        });

        await transfersRepository.create({
            sender_id: user_sender.id as string,
            receiver_id: user_receiver.id as string,
            amount: 700,
            description: "first transfer"
        });
    });

    it("should get balance", async () => {
        const senderBalance = await getBalanceUseCase.execute({
            user_id: user_sender.id as string
        });
        expect(senderBalance.balance).toBe(300);

        const receiverBalance = await getBalanceUseCase.execute({
            user_id: user_receiver.id as string
        });
        expect(receiverBalance.balance).toBe(1700);
    });

    it("should throw if user is invalid", () => {
        expect(async () => {
            await getBalanceUseCase.execute({
                user_id: "invalid user id"
            });
        }).rejects.toBeInstanceOf(GetBalanceError);
    });
});