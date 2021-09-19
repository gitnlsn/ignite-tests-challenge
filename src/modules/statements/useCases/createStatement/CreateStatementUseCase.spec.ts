import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("CreateStatementUseCase", () => {
    // InMemory repositories
    let statementsRepository: IStatementsRepository;
    let usersRepository: IUsersRepository;

    // createstatementUseCase
    let createStatementUseCase: CreateStatementUseCase;

    let userData = {
        email: "userteste@mail.com",
        name: "user name",
        password: "user password"
    };

    let user: User;

    beforeEach(async () => {
        statementsRepository = new InMemoryStatementsRepository();
        usersRepository = new InMemoryUsersRepository();

        createStatementUseCase = new CreateStatementUseCase(
            usersRepository,
            statementsRepository
        );

        await usersRepository.create({
            email: userData.email,
            name: userData.name,
            password: userData.password
        })
        user = await usersRepository.findByEmail(userData.email) as User;
    });

    it("should create statement", async () => {
        const createdStatement = await createStatementUseCase.execute({
            user_id: user.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "description"
        });

        const storedStatement = await statementsRepository.findStatementOperation({
            user_id: user.id as string,
            statement_id: createdStatement.id as string
        });

        expect(storedStatement).not.toBeFalsy();
        expect(storedStatement?.id).toBe(createdStatement.id);
        expect(storedStatement?.user_id).toBe(createdStatement.user_id);
        expect(storedStatement?.amount).toBe(1000);
        expect(storedStatement?.description).toBe("description");
        expect(storedStatement?.type).toBe(OperationType.DEPOSIT);
    });

    it("should not create withdraw statement if balance gets negative", () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: user.id as string,
                type: OperationType.DEPOSIT,
                amount: 1000,
                description: "description"
            });
    
            await createStatementUseCase.execute({
                user_id: user.id as string,
                type: OperationType.WITHDRAW,
                amount: 1500,
                description: "description"
            });
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
    });


    it("should fail to create statement if user does not exist", () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: "false user_id",
                type: OperationType.DEPOSIT,
                amount: 1000,
                description: "description"
            });
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
    });
});