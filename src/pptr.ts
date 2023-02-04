const puppeteer = require('puppeteer-core');
// import puppeteer from 'puppeteer-extra';
// import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const config: any = {
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-gpu",
  ]
};

// puppeteer.use(AdblockerPlugin()).use(StealthPlugin());

let instances = 0;

let browser: any | null = null;

export const getPage = async () => {
  if (!browser) {
    console.log('instantiating browser');
    browser = await puppeteer.launch(config);
  }
  instances++;
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
  );
  return page;
};

export const closePage = async (page: any) => {
  instances--;
  await page.close();
  if (instances === 0) {
    console.log('closing browser');
    await browser?.close();
    browser = null;
  }
};
