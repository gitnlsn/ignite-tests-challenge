import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
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

    // getBalanceUseCase
    let getBalanceUseCase: GetBalanceUseCase;

    let userData = {
        email: "userteste@mail.com",
        name: "user name",
        password: "user password"
    };

    let user: User;

    beforeEach(async () => {
        statementsRepository = new InMemoryStatementsRepository();
        usersRepository = new InMemoryUsersRepository();

        getBalanceUseCase = new GetBalanceUseCase(
            statementsRepository,
            usersRepository,
        );

        await usersRepository.create({
            email: userData.email,
            name: userData.name,
            password: userData.password
        })
        user = await usersRepository.findByEmail(userData.email) as User;

        await statementsRepository.create({
            user_id: user.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "description"
        });

        await statementsRepository.create({
            user_id: user.id as string,
            type: OperationType.WITHDRAW,
            amount: 600,
            description: "description"
        });
    });

    it("should get balance", async () => {
        const balance = await getBalanceUseCase.execute({
            user_id: user.id as string
        });
        expect(balance.balance).toBe(400);
    });

    it("should throw if user is invalid", () => {
        expect(async () => {
            await getBalanceUseCase.execute({
                user_id: "invalid user id"
            });
        }).rejects.toBeInstanceOf(GetBalanceError);
    });
});