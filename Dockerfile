FROM node:22.10.0-alpine
LABEL authors="arthurzakharov"
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD ["node", "server.js"]