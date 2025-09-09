# Stage runtime
FROM node:24-alpine3.21 AS runtime

WORKDIR /app

# Copy package.json + pnpm-lock.yaml để cài dependency
COPY package.json pnpm-lock.yaml* ./

# Cài dependencies production
RUN npm install -g pnpm && pnpm install --prod

# Copy dist đã build sẵn
COPY dist ./dist

# Copy file .env nếu cần
COPY .env .env

EXPOSE 5000
# Chạy app
CMD ["node", "dist/index.js"]
