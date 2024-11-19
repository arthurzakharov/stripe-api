FROM node:22-alpine
LABEL authors="arthurzakharov"
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
