import { MongoClient } from 'mongodb';

export const client = new MongoClient(process.env.DATABASE_URL!);

export const ExtractorCollection = client.db('web-extractor').collection('Extractor');
export const SelectorCollection = client.db('web-extractor').collection('Selector');
export const ResultCollection = client.db('web-extractor').collection('Result');
export const PreviewCollection = client.db('web-extractor').collection('Preview');
