FROM node:lts-alpine3.14

WORKDIR /usr/src/app

RUN npm i -g nodemon

COPY package*.json .
RUN npm i

COPY ./public ./public
COPY ./dist ./dist

EXPOSE 3000
CMD [ "npm", "run", "dev"]
