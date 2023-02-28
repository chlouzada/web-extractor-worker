import cron from 'node-cron';
import { getPage, closePage } from './pptr';
import {
  ExtractorCollection,
  ResultCollection,
  SelectorCollection,
  client,
  PreviewCollection,
} from './db';
import { ObjectId } from 'mongodb';

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
    createdAt: new Date(),
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
      values.push(String(value));

      if (!!value) {
        const text = await page.evaluate(() => document.body.textContent);
        console.log('No value found, printing text');
        console.log(text);
      }
    }

    await createResults(values, extractor);
  }

  await closePage(page);

  console.log('Done', ...executionId);
};

const preview = async () => {
  await client.connect();

  const started = new Date();

  const previews = await PreviewCollection.find<{
    _id: ObjectId;
    url: string;
    selectors: string[];
    createdAt: Date;
  }>({
    done: false,
  }).toArray();

  console.log(`Running ${previews.length} previews`);
  console.log(`Oldest preview: ${previews[0].createdAt}`);

  const page = await getPage();

  for (const item of previews) {
    const { url, selectors } = item;

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
      values.push(String(value));
    }

    await PreviewCollection.updateOne(
      { _id: item._id },
      {
        $set: {
          updatedAt: new Date(),
          done: true,
          values,
        },
      }
    );

    const time = new Date().getTime() - started.getTime();
    console.log(`Preview took ${time}ms`);

    if (time > 25) {
      console.log('Breaking');
      break;
    }
  }

  await closePage(page);
};

enum Schedule {
  EVERY_15_MIN = 'EVERY_15_MIN',
  EVERY_HOUR = 'EVERY_HOUR',
  EVERY_DAY = 'EVERY_DAY',
  EVERY_WEEK = 'EVERY_WEEK',
  EVERY_MONTH = 'EVERY_MONTH',
}

export const worker = () => {
  console.log('Worker initialized');
  cron.schedule('*/30 * * * * *', () => preview());
  cron.schedule('*/15 * * * *', () => run(Schedule.EVERY_15_MIN));
  cron.schedule('0 * * * *', () => run(Schedule.EVERY_HOUR));
  cron.schedule('0 0 * * *', () => run(Schedule.EVERY_DAY));
  cron.schedule('0 0 * * 1', () => run(Schedule.EVERY_WEEK));
  cron.schedule('0 0 1 * *', () => run(Schedule.EVERY_MONTH));
};
