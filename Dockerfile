FROM node:22.13.0-alpine
RUN mkdir -p /usr/src/app

COPY ./app/* /usr/src/app/
COPY ./app/* /usr/src/app/

WORKDIR /usr/src/app
RUN npm install
CMD node /usr/src/app/app.js