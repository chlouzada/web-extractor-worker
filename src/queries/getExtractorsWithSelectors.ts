import { Client } from 'pg';

const client = new Client();

export async function getExtractorsWithSelectors(schedule: string) {
  try {
    await client.connect();

    const res = await client.query(`
      SELECT *
      FROM extractor
      JOIN selector ON selector.extractor_id = extractor.id
      WHERE extractor.schedule = $1
    `, [schedule]);

    return res.rows;
  } catch (err) {
    console.error(err);
    return [];
  } finally {
    await client.end();
  }
}
