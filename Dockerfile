FROM node:18-buster-slim AS base

ARG NODE_ENV=production

WORKDIR /misskey

ENV BUILD_DEPS autoconf automake file g++ gcc libc-dev libtool make nasm pkg-config python3 zlib1g-dev git

FROM base AS builder

COPY . ./

RUN apt-get update && \
	apt-get install -y --no-install-recommends $BUILD_DEPS && \
	git submodule update --init && \
	yarn install && \
	yarn build && \
	rm -rf .git

FROM base AS runner

RUN apt-get update && \
	apt-get install -y --no-install-recommends \
	ffmpeg \
	tini

ENTRYPOINT ["/usr/bin/tini", "--"]

COPY --from=builder /misskey/node_modules ./node_modules
COPY --from=builder /misskey/built ./built
COPY --from=builder /misskey/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=builder /misskey/packages/backend/built ./packages/backend/built
COPY --from=builder /misskey/packages/client/node_modules ./packages/client/node_modules
COPY . ./

ENV NODE_ENV=production
CMD ["npm", "run", "migrateandstart"]
