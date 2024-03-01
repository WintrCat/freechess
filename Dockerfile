FROM node:20

LABEL name="wintrcat/freechess"
LABEL version="1.0.0"

WORKDIR /usr/app/

COPY . .

RUN npm install -g typescript
RUN npm i

ENV PORT 80

EXPOSE 80/tcp

ENTRYPOINT ["npm", "start"]