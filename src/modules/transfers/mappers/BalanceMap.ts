import { Transfer } from "../entities/transfers";

export class BalanceMap {
  static toDTO({statement, balance}: { statement: Transfer[], balance: number}) {
    const parsedStatement = statement.map(({
      id,
      sender_id,
      receiver_id,
      amount,
      description,
      created_at,
      updated_at,
    }) => (
      {
        id,
        sender_id,
        receiver_id,
        amount: Number(amount),
        description,
        type: "transfer",
        created_at,
        updated_at
      }
    ));

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
