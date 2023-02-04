import { Client } from 'pg';

const client = new Client();

export async function createResults(values: any[], extractor: any) {
  try {
    await client.connect();

    const data = values.map((value, index) => [
      value || null,
      extractor.id,
      extractor.selectors[index].id,
    ]);

    const query = `
      INSERT INTO result (value, extractor_id, selector_id)
      VALUES ${data.map(() => `($1, $2, $3)`).join(', ')}
    `;

    await client.query(query, data.flat());

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
