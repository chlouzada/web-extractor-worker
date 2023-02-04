import { Client } from 'pg';
import { getClient } from '../pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

export async function getExtractorsWithSelectors(schedule: string) {
  try {
    const client = await getClient();


    const res = await client.query(`
      SELECT *
      FROM Extractor
      JOIN Selector ON Selector.extractorId = Extractor.id
      WHERE Extractor.schedule = $1
    `, [schedule]);

    return res.rows;
  } catch (err) {
    console.error(err);
    return [];
  } finally {
    await client.end();
  }
}
