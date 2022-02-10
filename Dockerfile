
FROM node:16

COPY  cineworld-planner-*.tgz ./

RUN tar -xzf cineworld-planner-*.tgz

WORKDIR /package

EXPOSE 3000

CMD [ "npm", "run",  "start-node" ]
