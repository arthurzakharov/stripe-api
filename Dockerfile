FROM node:22-alpine
LABEL authors="arthurzakharov"
WORKDIR /app
COPY package*.json ./
ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "development" ]; then npm install; else npm ci --production; fi
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
