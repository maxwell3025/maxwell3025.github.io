FROM oven/bun:latest
WORKDIR /usr/src/app

COPY . .

RUN bun install
RUN bun run --env-file .env.production build
EXPOSE 443/tcp
CMD [ "bun", "start" ]
