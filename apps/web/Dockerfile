FROM node:24-slim
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
RUN npm ci
COPY apps/web apps/web
WORKDIR /repo/apps/web
CMD ["npm", "run", "dev"]
