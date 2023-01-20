import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';

const main = async () => {
  console.log('Running');

  const prisma = new PrismaClient();

  const extractors = await prisma.extractor.findMany({
    include: {
      selectors: true,
    },
  });

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  for (const extractor of extractors) {
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

    await prisma.result.createMany({
      data: values.map((value, index) => ({
        value: value || null,
        extractorId: extractor.id,
        selectorId: extractor.selectors[index].id,
      })),
    });
  }

  await browser.close();

  console.log('Done');
};

main();
