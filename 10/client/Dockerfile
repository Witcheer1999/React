# ---- Stage 1: Build ----
# Costruisce l'applicazione React
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copia package.json e lockfile
COPY package*.json ./

# Installa le dipendenze di produzione
RUN npm ci

# Copia il resto del codice sorgente
COPY . .

# Esegui la build di produzione di Vite
RUN npm run build

# ---- Stage 2: Prod ----
# Serve l'app buildata con Nginx
FROM nginx:1.25-alpine AS prod

# Imposta la directory di lavoro di Nginx
WORKDIR /usr/share/nginx/html

# Rimuovi la pagina di default di Nginx
RUN rm -rf ./*

# Copia i file buildati dallo stage 'build'
COPY --from=build /usr/src/app/dist .

# Copia la nostra configurazione Nginx personalizzata
# (La creeremo nel prossimo file)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Espone la porta 80 (standard HTTP)
EXPOSE 80

# Comando di default per avviare Nginx
CMD ["nginx", "-g", "daemon off;"]