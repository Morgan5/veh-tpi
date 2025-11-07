# Stage 1: Build de l'application
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code source
COPY . .

# Build de l'application (les variables d'environnement VITE_* seront injectées au build)
# Vite nécessite que les variables VITE_* soient disponibles au moment du build
ARG VITE_GRAPHQL_URL
ENV VITE_GRAPHQL_URL=${VITE_GRAPHQL_URL:-http://localhost:8000/graphql/}

RUN npm run build

# Stage 2: Serveur web nginx
FROM nginx:alpine

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]

