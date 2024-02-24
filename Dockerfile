FROM node:20

COPY * /app/

WORKDIR /app/

RUN npm install typescript

ENV PORT=80
# ENV RECAPTCHA_SECRET=<secret>

EXPOSE 80/tcp

CMD ["npm", "start"]