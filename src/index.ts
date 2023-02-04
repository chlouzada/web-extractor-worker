import { PrismaClient, Schedule } from '@prisma/client';
import { getPage, closePage } from './pptr';
import cron from 'node-cron';
import { getExtractorsWithSelectors } from './queries/getExtractorsWithSelectors';
import { createResults } from './queries/createResults';

import "dotenv/config"

console.log(process.env)

const run = async (schedule: Schedule) => {
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
          (selector) => document.querySelector(selector.selector)?.textContent,
          selector
        )
        .catch((err) => console.log(err));
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

run(Schedule.EVERY_15_MIN)
// cron.schedule('* * * * *', () => run(Schedule.EVERY_15_MIN));
// cron.schedule('*/15 * * * *', () => run(Schedule.EVERY_15_MIN));
// cron.schedule('0 * * * *', () => run(Schedule.EVERY_HOUR));
// cron.schedule('0 0 * * *', () => run(Schedule.EVERY_DAY));
// cron.schedule('0 0 * * 1', () => run(Schedule.EVERY_WEEK));
// cron.schedule('0 0 1 * *', () => run(Schedule.EVERY_MONTH));
