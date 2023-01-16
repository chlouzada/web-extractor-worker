import { connect } from 'mongoose';
import { ExtractionModel } from './models/extraction';
import puppeteer from 'puppeteer';

require('dotenv').config();

connect(process.env.DB!, async (err) => {
  if (err) {
    console.log('error connecting to db: ', err);
    process.exit(1);
  }

  console.log('connected to db');

  main();
});


const main = async () => {
  console.log('running');

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const extractions = await ExtractionModel.find({});

  console.log(extractions);

  for (const extraction of extractions) {
    await page.goto(extraction.url);
    const values = [];
    for (const selector of extraction.selectors) {
      const value = await page
        .evaluate(
          (selector) => document.querySelector(selector)?.textContent,
          selector
        )
        .catch((err) => console.log(err));
      values.push(value);
    }
    extraction.extracted.push({
      at: new Date(),
      value: values.join(' '),
    });
    await extraction.save();
  }

  await browser.close();

  console.log('done');
};
