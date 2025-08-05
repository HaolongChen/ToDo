FROM node:latest AS frontend-builder

WORKDIR /app/frontend


COPY ./frontend/package*.json ./

RUN npm i --no-audit --no-fund


COPY ./frontend .
# RUN npx vite build
RUN npm run build

FROM node:latest AS backend-builder

WORKDIR /app


COPY ./package*.json  ./

RUN npm install --no-audit --no-fund

COPY ./backend ./backend

FROM node:latest

WORKDIR /app

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package*.json ./
COPY --from=backend-builder /app/backend ./backend

RUN touch .env

EXPOSE 5000

CMD [ "npm", "start" ]