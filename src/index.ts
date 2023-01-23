import { PrismaClient, Schedule } from '@prisma/client';
import { getBrowser, closeBrowser } from './pptr';
import cron from 'node-cron';

const prisma = new PrismaClient();

const run = async (schedule: Schedule) => {
  const executionId = [schedule, new Date().toISOString()]
  console.log('Running', ...executionId);

  const [extractors, browser] = await Promise.all([
    prisma.extractor.findMany({
      where: {
        schedule,
      },
      include: {
        selectors: true,
      },
    }),
    getBrowser(),
  ]);

  const page = await browser.newPage();

  for (const extractor of extractors) {
    const { url, selectors } = extractor;

    await page.goto(url);

    const values = [];
    for (const selector of selectors) {
      const value = await page
        .evaluate(
          (selector) => document.querySelector(selector.selector)?.textContent,
          selector
        )
        .catch((err) => console.log(err));
      values.push(value);
    }

    console.log(url, values);

    prisma.result.createMany({
      data: values.map((value, index) => ({
        value: value || null,
        extractorId: extractor.id,
        selectorId: extractor.selectors[index].id,
      })),
    });
  }

  // close page
  await page.close();

  // close browser
  await closeBrowser();

  console.log('Done', ...executionId);
};

cron.schedule('* * * * *', () => run(Schedule.EVERY_15_MIN));
// cron.schedule('*/15 * * * *', () => run(Schedule.EVERY_15_MIN));
// cron.schedule('0 * * * *', () => run(Schedule.EVERY_HOUR));
// cron.schedule('0 0 * * *', () => run(Schedule.EVERY_DAY));
// cron.schedule('0 0 * * 1', () => run(Schedule.EVERY_WEEK));
// cron.schedule('0 0 1 * *', () => run(Schedule.EVERY_MONTH));
