import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../app';
import { User } from '../modules/users/entities/User';

describe("transfers", () => {
    let userData_sender = {
        name: "username",
        email: "user1@mail.com",
        password: "userpassword",
    };

    let userData_receiver = {
        name: "username",
        email: "user2@mail.com",
        password: "userpassword",
    };

    let connection: Connection;
    let token_sender: string;
    let token_receiver: string;
    let user_sender: User;
    let user_receiver: User;

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    beforeEach(async () => {
        await request(app).post("/api/v1/users").send({
            name: userData_sender.name,
            email: userData_sender.email,
            password: userData_sender.password,
        });
        const response_sender = await request(app).post("/api/v1/sessions").send({
            email: userData_sender.email,
            password: userData_sender.password,
        });
        token_sender = response_sender.body.token;
        user_sender = response_sender.body.user;

        await request(app).post("/api/v1/users").send({
            name: userData_receiver.name,
            email: userData_receiver.email,
            password: userData_receiver.password,
        });
        const response_receiver = await request(app).post("/api/v1/sessions").send({
            email: userData_receiver.email,
            password: userData_receiver.password,
        });
        token_receiver = response_receiver.body.token;
        user_receiver = response_receiver.body.user;

        await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Token ${token_sender}`)
            .send({
                amount: 800,
                description: "first deposit"
            });

        await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Token ${token_receiver}`)
            .send({
                amount: 900,
                description: "first deposit"
            });
    })

    afterEach(async () => {
        await connection.query("delete from transfers");
        await connection.query("delete from statements");
        await connection.query("delete from users");
    })

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should do transfer", async () => {
        const transferResponse = await request(app)
            .post(`/api/v1/statements/transfer/${user_receiver.id}`)
            .set('Authorization', `Token ${token_sender}`)
            .send({
                amount: 700,
                description: "first transfer"
            });

        expect(transferResponse.statusCode).toBe(201);
        expect(transferResponse.body).toHaveProperty("id");
        expect(transferResponse.body).toHaveProperty("sender_id", user_sender.id);
        expect(transferResponse.body).toHaveProperty("receiver_id", user_receiver.id);
    });

    it("should not do transfer if not enough money", async () => {
        const transferResponse = await request(app)
            .post(`/api/v1/statements/transfer/${user_receiver.id}`)
            .set('Authorization', `Token ${token_sender}`)
            .send({
                amount: 900,
                description: "first transfer"
            });

        expect(transferResponse.statusCode).not.toBe(201);
    });

    it("should show balance with transfer", async () => {
        await request(app)
            .post(`/api/v1/statements/transfer/${user_receiver.id}`)
            .set('Authorization', `Token ${token_sender}`)
            .send({
                amount: 700,
                description: "first transfer"
            });

        const balanceResponse = await request(app)
            .get("/api/v1/statements/balance")
            .set('Authorization', `Token ${token_sender}`)
            .send();

        expect(balanceResponse.statusCode).toBe(200);
        expect(balanceResponse.body.balance).toBe(100);
        expect(balanceResponse.body.statement.length).toBe(2);

        const balanceResponseReceiver = await request(app)
            .get("/api/v1/statements/balance")
            .set('Authorization', `Token ${token_receiver}`)
            .send();

        expect(balanceResponseReceiver.statusCode).toBe(200);
        expect(balanceResponseReceiver.body.balance).toBe(1600);
        expect(balanceResponseReceiver.body.statement.length).toBe(2);
    })
});