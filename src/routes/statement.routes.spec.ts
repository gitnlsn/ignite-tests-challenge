import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../app';

describe("statements", () => {
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
        await connection.query("delete from statements");
    })

    afterAll(async () => {
        await connection.query("delete from users");
        await connection.dropDatabase();
        await connection.close();
    })

    it("should allow deposit", async () => {
        const response = await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Token ${token}`)
            .send({
                amount: 1000,
                description: "first deposit"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body).toHaveProperty("user_id");
        expect(response.body).toHaveProperty("type");
        expect(response.body).toHaveProperty("amount", 1000);
        expect(response.body).toHaveProperty("description", "first deposit");
    });

    it("should allow balance", async () => {
        await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Token ${token}`)
            .send({
                amount: 800,
                description: "first deposit"
            });

        await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Token ${token}`)
            .send({
                amount: 900,
                description: "second deposit"
            });

        const response = await request(app)
            .get("/api/v1/statements/balance")
            .set('Authorization', `Token ${token}`)
            .send();
        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty("balance", 1700);
        expect(response.body).toHaveProperty("statement");
    });

    it("should allow withdraw", async () => {
        await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Token ${token}`)
            .send({
                amount: 1000,
                description: "first deposit"
            });

        const response = await request(app)
            .post("/api/v1/statements/withdraw")
            .set('Authorization', `Token ${token}`)
            .send({
                amount: 1000,
                description: "first withdraw"
            });
        expect(response.statusCode).toBe(201);

        expect(response.body).toHaveProperty("user_id");
        expect(response.body).toHaveProperty("type");
        expect(response.body).toHaveProperty("amount", 1000);
        expect(response.body).toHaveProperty("description", "first withdraw");
    });

    it("should not allow withdraw if no positive balance", async () => {
        await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Token ${token}`)
            .send({
                amount: 1000,
                description: "first deposit"
            });

        const response = await request(app)
            .post("/api/v1/statements/withdraw")
            .set('Authorization', `Token ${token}`)
            .send({
                amount: 1001,
                description: "first withdraw"
            });
        expect(response.statusCode).not.toBe(201);
    });

    it("should show specific statement", async () => {
        const depositResponse = await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Token ${token}`)
            .send({
                amount: 800,
                description: "first deposit"
            });

        const depositId = depositResponse.body.id;

        const response = await request(app)
            .get(`/api/v1/statements/${depositId}`)
            .set('Authorization', `Token ${token}`)
            .send();
        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("amount");
        expect(response.body).toHaveProperty("type", "deposit");
        expect(response.body).toHaveProperty("description");
    });
});