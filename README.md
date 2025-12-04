# Carrinho de Compras Virtual Utilizando Redis + Node.js + Docker

O objetivo principal é estudar e demonstrar a **instalação, configuração e utilização do Redis** em conjunto com uma aplicação desenvolvida em **Node.js**, utilizando **Docker** para a execução do banco de dados.

---

## 📌 Objetivos

Este repositório visa:

- Demonstrar como configurar e executar o **Redis via Docker**;
- Integrar o Redis com uma aplicação escrita em **Node.js**;
- Explorar conceitos fundamentais de armazenamento chave-valor;
- Implementar um pequeno exemplo prático utilizando Redis.

---

## 🛠 Tecnologias Utilizadas

- **Redis**;
- **Docker**;
- **Node.js**;
- **Biblioteca oficial `redis` para JavaScript**.

---

## 🚀 Como executar o projeto

### 1. Clonar este repositório

### 2. Subir o Redis com Docker

```bash
docker-compose up -d
```

O Redis ficará disponível em:

```
localhost:6379
```

### 3. Instalar dependências do Node.js

```bash
npm install
```

### 4. Iniciar a aplicação

```bash
npm start
```

---

## 📁 Estrutura do Repositório

```
redis-db/
 ├── src/
 │    ├── server.js
 │    ├── redisClient.js
 │    └── utils/
 │
 ├── docker-compose.yml
 ├── package.json
 ├── .gitignore
 └── README.md
```

---

## 👥 Autores

Em breve.

---

## 📄 Licença

Este projeto é destinado a fins exclusivamente acadêmicos.
