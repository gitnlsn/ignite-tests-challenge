import { hash } from "bcryptjs";
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("ShowUserProfileUseCase", () => {
    let usersRepository: IUsersRepository;
    let showUserProfileUseCase: ShowUserProfileUseCase;

    let userData = {
        email: "userteste@mail.com",
        name: "user name",
        password: "user password"
    };

    let user: User;

    beforeEach(async () => {
        usersRepository = new InMemoryUsersRepository();

        showUserProfileUseCase = new ShowUserProfileUseCase(
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
            id,
            name,
            email
        } = await showUserProfileUseCase.execute(user.id as string);

        expect(id).toBe(user.id);
        expect(email).toBe(user.email);
        expect(name).toBe(user.name);
    });

    it("should not authenticate user if incorrect email", () => {
        expect(async () => {
            await showUserProfileUseCase.execute("invalid id");
        }).rejects.toBeInstanceOf(ShowUserProfileError);
    });
})