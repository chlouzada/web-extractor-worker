import { Client } from "pg";


let client: Client | null = null;

export const getClient = async () => {
  if (!client) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect()
  }
  return client;
}
