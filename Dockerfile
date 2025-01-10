FROM node:18.20.5-alpine
RUN mkdir -p /usr/src/app

COPY ./app/* /usr/src/app/
COPY ./app/* /usr/src/app/

WORKDIR /usr/src/app
RUN npm install
CMD node /usr/src/app/index.js