import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis({
  host: "localhost",
  port: 6379,
});

// Criar Produto
app.post("/produtos", async (req, res) => {
  const { id, nome, preco, estoque } = req.body;

  await redis.hset(`fastcard:produtos:${id}`, {
    nome,
    preco,
    estoque,
  });

  res.json({ message: "Produto criado!" });
});

// Listar Produtos
app.get("/produtos", async (req, res) => {
  const keys = await redis.keys("fastcard:produtos:*");

  const produtos = [];

  for (const k of keys) {
    const p = await redis.hgetall(k);
    produtos.push({
      id: k.split(":")[2],
      ...p,
    });
  }

  res.json(produtos);
});

// Adicionar ao carrinho
app.post("/carrinho", async (req, res) => {
  const { clienteId, produtoId, quantidade } = req.body;

  const key = `fastcard:carrinho:cliente:${clienteId}`;

  await redis.hincrby(key, produtoId, quantidade);

  res.json({ message: "Item adicionado" });
});

// Listar Carrinho
app.get("/carrinho/:clienteId", async (req, res) => {
  const clienteId = req.params.clienteId;

  const key = `fastcard:carrinho:cliente:${clienteId}`;

  const carrinho = await redis.hgetall(key);

  res.json(carrinho);
});

// Finalizar Compra
app.post("/finalizar", async (req, res) => {
  const clienteId = req.body.clienteId;

  const key = `fastcard:carrinho:cliente:${clienteId}`;
  const ranking = `fastcard:ranking:vendas`;

  const items = await redis.hgetall(key);

  for (const produtoId in items) {
    const quantidade = parseInt(items[produtoId]);

    await redis.zincrby(ranking, quantidade, `fastcard:produtos:${produtoId}`);
  }

  await redis.del(key);

  res.json({ message: "Compra finalizada" });
});

// Ranking
app.get("/ranking", async (req, res) => {
  const r = await redis.zrevrange(
    "fastcard:ranking:vendas",
    0,
    10,
    "WITHSCORES"
  );
  res.json(r);
});

app.listen(3000, () => {
  console.log("API rodando em http://localhost:3000");
});
