FROM node:16
ENV TZ "Asia/Ho_Chi_Minh"

COPY package*.json ./
RUN npm install
COPY . .
WORKDIR /usr/app
EXPOSE 8081
ENTRYPOINT exec npm start
