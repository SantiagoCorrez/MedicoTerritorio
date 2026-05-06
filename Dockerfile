# Stage 1: Build Angular Frontend (Admin)
FROM node:18-alpine AS build-admin
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Vite Map (AppMapas)
FROM node:18-alpine AS build-map
WORKDIR /app/appMapas
COPY appMapas/package*.json ./
RUN npm install
COPY appMapas/ ./
RUN npm run build

# Stage 3: Setup Backend and combine
FROM node:18-alpine
WORKDIR /app

# Copy built artifacts from previous stages
COPY --from=build-admin /app/frontend/dist/ /app/frontend/dist/
COPY --from=build-map /app/appMapas/dist/ /app/appMapas/dist/

# Setup Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Expose the API port
EXPOSE 3001

CMD ["npm", "start"]
