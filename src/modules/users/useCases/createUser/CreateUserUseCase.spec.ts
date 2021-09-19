import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("CreateUserUseCase", () => {
    let usersRepository: IUsersRepository;
    let createUsersUseCase: CreateUserUseCase;

    let userData = {
        email: "userteste@mail.com",
        name: "user name",
        password: "user password"
    };

    let user: User;


    beforeEach(async () => {
        usersRepository = new InMemoryUsersRepository();

        createUsersUseCase = new CreateUserUseCase(
            usersRepository,
        );
    });

    it("should create user", async () => {
        await createUsersUseCase.execute({
            email: userData.email,
            name: userData.name,
            password: userData.password
        });

        const createdUser = await usersRepository.findByEmail(userData.email);

        expect(createdUser).not.toBeFalsy();
        expect(createdUser).toHaveProperty("id");
    });

    it("should not create user with existing email", () => {
        expect(async () => {
            await createUsersUseCase.execute({
                email: userData.email,
                name: userData.name,
                password: userData.password
            });
            await createUsersUseCase.execute({
                email: userData.email,
                name: userData.name,
                password: userData.password
            });
        }).rejects.toBeInstanceOf(CreateUserError);

    });
})