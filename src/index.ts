import { getPage, closePage } from './pptr';
import cron from 'node-cron';

import 'dotenv/config';

import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.DATABASE_URL!);
const ExtractorCollection = client.db('web-extractor').collection('Extractor');
const SelectorCollection = client.db('web-extractor').collection('Selector');
const ResultCollection = client.db('web-extractor').collection('Result');

const getExtractorsWithSelectors = async (schedule: any) => {
  const extractors = await ExtractorCollection.find({ schedule }).toArray();
  const ids = extractors.map((extractor) => extractor._id);

  const selectors = await SelectorCollection.find({
    extractorId: { $in: ids },
  }).toArray();

  console.log(selectors);

  extractors.map((extractor) => {
    extractor.selectors = selectors.filter(
      (selector) => selector.extractorId.toString() === extractor._id.toString()
    );
  });

  return extractors;
};

const createResults = async (values: any, extractor: any) => {
  const { _id } = extractor;
  const results = values.map((value: any, index: any) => ({
    value,
    selectorId: extractor.selectors[index]._id,
    extractorId: _id,
  }));
  await ResultCollection.insertMany(results);
};

const run = async (schedule: any) => {
  await client.connect();

  const executionId = [schedule, new Date().toISOString()];
  console.log('Running', ...executionId);

  const [extractors, page] = await Promise.all([
    getExtractorsWithSelectors(schedule),
    getPage(),
  ]);

  for (const extractor of extractors) {
    const { url, selectors } = extractor;

    await page.goto(url, { waitUntil: 'networkidle2' });

    const values = [];
    for (const selector of selectors) {
      const value = await page
        .evaluate(
          (selector: any) =>
            document.querySelector(selector.selector)?.textContent,
          selector
        )
        .catch((err: any) => console.log(err));
      values.push(value);

      // print page texts
      const text = await page.evaluate(() => document.body.textContent);
      console.log(text);
    }

    await createResults(values, extractor);
  }

  // close page
  await closePage(page);

  // close browser
  // await closeBrowser();

  console.log('Done', ...executionId);
};

enum Schedule {
  EVERY_15_MIN = 'EVERY_15_MIN',
  EVERY_HOUR = 'EVERY_HOUR',
  EVERY_DAY = 'EVERY_DAY',
  EVERY_WEEK = 'EVERY_WEEK',
  EVERY_MONTH = 'EVERY_MONTH',
}

run(Schedule.EVERY_HOUR);
// cron.schedule('* * * * *', () => run(Schedule.EVERY_15_MIN));
// cron.schedule('*/15 * * * *', () => run(Schedule.EVERY_15_MIN));
// cron.schedule('0 * * * *', () => run(Schedule.EVERY_HOUR));
// cron.schedule('0 0 * * *', () => run(Schedule.EVERY_DAY));
// cron.schedule('0 0 * * 1', () => run(Schedule.EVERY_WEEK));
// cron.schedule('0 0 1 * *', () => run(Schedule.EVERY_MONTH));
