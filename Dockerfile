FROM node:16-bullseye as dev

WORKDIR /app

CMD ["yarn", "dev"]
