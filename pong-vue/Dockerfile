FROM node:lts-alpine

RUN npm install -g http-server
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN cp dist/index.html dist/404.html
RUN mkdir dist/config
VOLUME /app/dist/config

EXPOSE 8080

CMD [ "http-server", "dist" ]