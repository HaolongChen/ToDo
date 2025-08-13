FROM node:20 AS frontend-builder

# Expect the frontend to be built locally; just copy the dist output
WORKDIR /app/frontend
COPY ./frontend/dist ./dist

FROM node:20

WORKDIR /app

# Copy package manifests first and install backend deps in final image
COPY ./package*.json ./
ENV HTTP_PROXY="" HTTPS_PROXY="" NPM_CONFIG_PROXY="" NPM_CONFIG_HTTPS_PROXY=""
RUN npm config delete proxy || true && npm config delete https-proxy || true
RUN npm cache clean --force || true
COPY ./node_modules ./node_modules
# Fallback install only if express files are missing
RUN test -f node_modules/express/index.js || (npm config set registry https://registry.npmjs.org && npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund)

# Copy backend source
COPY ./backend ./backend

# Verify express resolved (non-fatal)
RUN node -e "console.log(require.resolve('express/package.json'))" || true

# Copy prebuilt frontend assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN touch .env

EXPOSE 5000

CMD [ "npm", "start" ]