FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Vite port
EXPOSE 5173

# IMPORTANT: bind to 0.0.0.0 so Komodo/host can reach it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
