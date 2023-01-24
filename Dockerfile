FROM ubuntu:latest

# Add google-chrome-stable for puppeteer
RUN \
    apt-get update && \
    apt-get install -y wget gnupg && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install -y google-chrome-stable
    
RUN \
    apt-get update && \
    apt-get install -y wget && \
    wget -q -O - https://deb.nodesource.com/setup_18.x  | bash - && \
    apt-get install -y nodejs build-essential xvfb

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

WORKDIR /usr/src/app

COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000

CMD xvfb-run --server-args="-screen 0 1024x768x24" npm start
