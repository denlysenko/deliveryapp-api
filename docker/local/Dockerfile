FROM node:12.16.1-alpine
LABEL author="denlysenko"
WORKDIR /var/www/deliveryapp-api
COPY package.json /var/www/deliveryapp-api
COPY package-lock.json /var/www/deliveryapp-api
RUN npm install
COPY dist/apps/api /var/www/deliveryapp-api
EXPOSE 3000
ENTRYPOINT npm run start:prod