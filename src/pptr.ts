import puppeteer, { Browser, PuppeteerLaunchOptions } from 'puppeteer';

const config: PuppeteerLaunchOptions = {
  headless: true,
  args: ['--no-sandbox'],
};

let instances = 0;

let browser: Browser | null = null;

export const getBrowser = async () => {
  if (!browser) {
    console.log('instantiating browser');
    browser = await puppeteer.launch(config);
  }
  instances++;
  return browser;
};

export const closeBrowser = async () => {
  instances--;
  if (instances === 0) {
    console.log('closing browser');
    await browser?.close();
    browser = null;
  }
};
