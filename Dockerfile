FROM alpine:latest

COPY * /app/

WORKDIR /app/

RUN apk update
RUN apk add nodejs
RUN npm install typescript

ENV PORT=80
# ENV RECAPTCHA_SECRET=<secret>

EXPOSE 80/tcp

CMD ["npm", "start"]