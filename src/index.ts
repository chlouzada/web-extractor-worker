import { PrismaClient } from '@prisma/client';
import { connect } from 'mongoose';
import puppeteer from 'puppeteer';

require('dotenv').config();

const main = async () => {
  console.log('running');

  const prisma = new PrismaClient();

  const extractors = await prisma.extractor.findMany({
    include: {
      selectors: true,
    },
  });

  console.log(extractors);

  const browser = await puppeteer.launch();
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

    // create many results

    await prisma.result.createMany({
      data: values.map((value, index) => ({
        value: value || null,
        extractorId: extractor.id,
        selectorId: extractor.selectors[index].id,
      })),
    });
  }

  await browser.close();

  console.log('done');
};

main();
