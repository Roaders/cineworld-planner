
# taken from https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/

FROM node:16-alpine

RUN apk add dumb-init

ENV NODE_ENV production

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm ci --only=production

CMD ["dumb-init", "node", "dist/node/server"]
