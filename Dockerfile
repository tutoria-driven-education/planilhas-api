FROM node:16.9

WORKDIR /app
COPY . .
RUN npm i

CMD ["npm", "run", "start"]