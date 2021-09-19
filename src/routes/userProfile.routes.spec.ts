import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../app';

describe("userProfiles", () => {
    let userData = {
        name: "username",
        email: "user@mail.com",
        password: "userpassword",
    };

    let connection: Connection;
    let token: string;

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
        const response = await request(app).post("/api/v1/sessions").send({
            email: userData.email,
            password: userData.password,
        });
        token = response.body.token;
    })

    afterEach(async () => {
        await connection.query("delete from users");
    })

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    })

    it("should show user profile", async () => {
        const response = await request(app)
            .get("/api/v1/profile")
            .set('Authorization', `Token ${token}`)
            .send();
        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty("name", userData.name);
        expect(response.body).toHaveProperty("email", userData.email);
    });

    it("should not show user profile if not authenticated", async () => {
        const response = await request(app)
            .get("/api/v1/profile")
            .set('Authorization', `Token wrongtoken`)
            .send();
        expect(response.statusCode).not.toBe(200);

        expect(response.body).not.toHaveProperty("name", userData.name);
        expect(response.body).not.toHaveProperty("email", userData.email);
    });
});