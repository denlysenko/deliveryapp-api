FROM node:12.16.1-alpine
LABEL author="denlysenko"
WORKDIR /var/www/deliveryapp-api
COPY package.json /var/www/deliveryapp-api
COPY package-lock.json /var/www/deliveryapp-api
RUN npm install
COPY . /var/www/deliveryapp-api
COPY .env.production ./.env
COPY firebase-adminsdk.json .
ENV NODE_ENV production
RUN npm run prestart:prod
EXPOSE 3000
CMD ["node", "dist/main.js"]