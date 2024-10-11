# Use uma imagem base oficial do Node.js
FROM node:14

# Define o diretório de trabalho no contêiner
WORKDIR /app

# Copia o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todos os arquivos do projeto para o diretório de trabalho
COPY . .

# Compila o projeto TypeScript
RUN npm run build

# Expõe a porta em que a aplicação irá rodar
EXPOSE 3000


# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]
