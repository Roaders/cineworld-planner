
FROM node:26-alpine

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node dist/node ./dist/node
COPY --chown=node:node dist/contracts ./dist/contracts

USER node

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/node/server"]
