# Dockerfile para deploy em VPS
FROM node:18-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Variável de ambiente para porta
ENV PORT=3000
ENV NODE_ENV=production

# Comando para iniciar
CMD ["npm", "start"]
