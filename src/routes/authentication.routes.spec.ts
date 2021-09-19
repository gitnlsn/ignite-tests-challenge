import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../app';

describe("authentication", () => {
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

    beforeEach(async () => {
        await request(app).post("/api/v1/users").send({
            name: userData.name,
            email: userData.email,
            password: userData.password,
        });
    })

    afterEach(async () => {
        await connection.query("delete from users");
    })

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    })

    it("should return token if user is authenticated", async () => {
        const response = await request(app).post("/api/v1/sessions").send({
            email: userData.email,
            password: userData.password,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it("should not return token if user is not authenticated", async () => {
        const response = await request(app).post("/api/v1/sessions").send({
            email: userData.email,
            password: "wrong password",
        });
        expect(response.statusCode).not.toBe(200);
        expect(response.body).not.toHaveProperty('token');
    });
});