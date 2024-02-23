FROM Alpine:latest

COPY * /app/

WORKDIR /app/

RUN apt-get update
RUN apt-get install nodejs
RUN npm install typescript

ENV PORT=80
# ENV RECAPTCHA_SECRET=<secret>

EXPOSE 80/tcp

CMD ["npm", "start"]