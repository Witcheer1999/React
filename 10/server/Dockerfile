# Stage 1: Usa un'immagine Node leggera (basata su Alpine Linux)
FROM node:20-alpine AS base

# Imposta la directory di lavoro all'interno del container
WORKDIR /usr/src/app

# Copia prima package.json e package-lock.json
COPY package*.json ./

# Installa *TUTTE* le dipendenze (incluse quelle di sviluppo)
# Questo è necessario affinché `nodemon` sia disponibile per lo script `dev`
# usato da docker-compose.
RUN npm ci

# Copia il resto del codice sorgente dell'app
COPY . .

# Espone la porta che il nostro server userà
EXPOSE 8080

# Il comando di default per la produzione (verrà sovrascritto da compose)
CMD [ "npm", "run", "start" ]