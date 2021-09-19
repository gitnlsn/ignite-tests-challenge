import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("getStatementOperationUseCase", () => {
    // InMemory repositories
    let statementsRepository: IStatementsRepository;
    let usersRepository: IUsersRepository;

    // createstatementUseCase
    let getStatementOperationUseCase: GetStatementOperationUseCase;

    let userData = {
        email: "userteste@mail.com",
        name: "user name",
        password: "user password"
    };

    let user: User;
    let statement: Statement;

    beforeEach(async () => {
        statementsRepository = new InMemoryStatementsRepository();
        usersRepository = new InMemoryUsersRepository();

        getStatementOperationUseCase = new GetStatementOperationUseCase(
            usersRepository,
            statementsRepository
        );

        await usersRepository.create({
            email: userData.email,
            name: userData.name,
            password: userData.password
        })
        user = await usersRepository.findByEmail(userData.email) as User;

        statement = await statementsRepository.create({
            user_id: user.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "description"
        });
    });

    it("should create statement", async () => {
        const createdStatement = await getStatementOperationUseCase.execute({
            user_id: user.id as string,
            statement_id: statement.id as string
        });

        expect(createdStatement).not.toBeFalsy();
        expect(createdStatement?.id).toBe(createdStatement.id);
        expect(createdStatement?.user_id).toBe(createdStatement.user_id);
        expect(createdStatement?.amount).toBe(1000);
        expect(createdStatement?.description).toBe("description");
        expect(createdStatement?.type).toBe(OperationType.DEPOSIT);
    });

    it("should fail to get statement if user does not exist", () => {
        expect(async () => {
            await getStatementOperationUseCase.execute({
                user_id: "false user_id",
                statement_id: statement.id as string
            });
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
    });

    it("should fail to get statement if statement does not exist", () => {
        expect(async () => {
            await getStatementOperationUseCase.execute({
                user_id: user.id as string,
                statement_id: "invalid statement id"
            });
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
    });
});