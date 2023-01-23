import { PrismaClient, Schedule } from '@prisma/client';
import moment from 'moment';
import puppeteer from 'puppeteer';
import cron from 'node-cron';

const browser = puppeteer.launch({
  args: ['--no-sandbox'],
});
const prisma = new PrismaClient();

const run = async (schedule: Schedule) => {
  console.log('Running', schedule);

  const extractors = await prisma.extractor.findMany({
    where: {
      schedule,
    },
    include: {
      selectors: true,
    },
  });

  console.log(extractors);

  const page = await (await browser).newPage();

  console.log(page);

  for (const extractor of extractors) {
    console.log(extractor.url);
    await page.goto(extractor.url);
    const values = [];
    for (const selector of extractor.selectors) {
      const value = await page
        .evaluate(
          (selector) => document.querySelector(selector.selector)?.textContent,
          selector
        )
        .catch((err) => console.log(err));
      values.push(value);
    }
    console.log(values);
    await prisma.result.createMany({
      data: values.map((value, index) => ({
        value: value || null,
        extractorId: extractor.id,
        selectorId: extractor.selectors[index].id,
      })),
    });
  }

  // close page
  await page.close();

  console.log('Done');
};

// run(Schedule.EVERY_15_MIN);
cron.schedule('*/15 * * * *', () => run(Schedule.EVERY_15_MIN));
cron.schedule('0 * * * *', () => run(Schedule.EVERY_HOUR));
cron.schedule('0 0 * * *', () => run(Schedule.EVERY_DAY));
cron.schedule('0 0 * * 1', () => run(Schedule.EVERY_WEEK));
cron.schedule('0 0 1 * *', () => run(Schedule.EVERY_MONTH));