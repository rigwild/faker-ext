FROM node:lts-alpine3.14

WORKDIR /usr/src/app
COPY ./public .
COPY package*.json .
COPY ./dist ./dist
RUN yarn install --production

EXPOSE 3000
CMD [ "yarn", "run", "start" ]