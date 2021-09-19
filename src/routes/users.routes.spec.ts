import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../app';

describe("users", () => {
    let userData = {
        name: "username",
        email: "user@mail.com",
        password: "userpassword",
    };

    let connection: Connection;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterEach(async () => {
        await connection.query("delete from users");
    })

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    })

    it("should create user", async () => {
        const response = await request(app).post("/api/v1/users").send({
            name: userData.name,
            email: userData.email,
            password: userData.password,
        });
        expect(response.statusCode).toBe(201);

        const users = await connection.query('select * from users');
        expect(users).toHaveLength(1);
        expect(users[0]).toHaveProperty("name", userData.name);
        expect(users[0]).toHaveProperty("email", userData.email);
    });

    it("should not create user with same email", async () => {
        await request(app).post("/api/v1/users").send({
            name: userData.name,
            email: userData.email,
            password: userData.password,
        });

        const response = await request(app).post("/api/v1/users").send({
            name: userData.name,
            email: userData.email,
            password: userData.password,
        });
        expect(response.statusCode).toBe(400);

        const users = await connection.query('select * from users');
        expect(users).toHaveLength(1);
        expect(users[0]).toHaveProperty("name", userData.name);
        expect(users[0]).toHaveProperty("email", userData.email);
    });
});