FROM node:14

WORKDIR /home/usr/app

COPY package*.json ./

RUN npm install -g serverless

RUN npm install

COPY . .