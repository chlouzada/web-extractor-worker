FROM node:16

# Add google-chrome-stable for puppeteer
RUN \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable zip && \
    rm -rf /var/lib/apt/lists/*s

WORKDIR /usr/src/app

COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000

CMD npm start
