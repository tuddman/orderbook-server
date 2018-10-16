FROM node:8-alpine

WORKDIR /opt/app

COPY package*.json ./

RUN npm install

COPY src /opt/app

EXPOSE 80

CMD [ "node", "index.js" ]
