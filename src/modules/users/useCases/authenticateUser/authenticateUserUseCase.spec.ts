import { hash } from "bcryptjs";
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("AuthenticateUserUseCase", () => {
    let usersRepository: IUsersRepository;
    let authenticateUsersUseCase: AuthenticateUserUseCase;

    let userData = {
        email: "userteste@mail.com",
        name: "user name",
        password: "user password"
    };

    let user: User;

    beforeEach(async () => {
        usersRepository = new InMemoryUsersRepository();

        authenticateUsersUseCase = new AuthenticateUserUseCase(
            usersRepository,
        );

        await usersRepository.create({
            email: userData.email,
            name: userData.name,
            password: await hash(userData.password, 8)
        })
        user = await usersRepository.findByEmail(userData.email) as User;
    });

    it("should authenticate user", async () => {        
        const {
            token,
            user: { id, name, email }
        } = await authenticateUsersUseCase.execute({
            email: userData.email,
            password: userData.password
        });

        expect(id).toBe(user.id);
        expect(email).toBe(user.email);
        expect(name).toBe(user.name);
    });

    it("should not authenticate user if incorrect email", () => {
        expect(async () => {
            await authenticateUsersUseCase.execute({
                email: "incorrect@mail.com",
                password: userData.password
            });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });

    it("should not authenticate user if incorrect password", () => {
        expect(async () => {
            await authenticateUsersUseCase.execute({
                email: userData.email,
                password: "incorrect password"
            });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });
})