FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application code
COPY . .

# Ensure entrypoint is executable
RUN chmod +x docker/entrypoint.sh

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "docker/entrypoint.sh"]
