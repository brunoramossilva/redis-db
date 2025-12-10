import Redis from "ioredis";
import { fakerPT_BR as faker } from "@faker-js/faker";
import { iniciarDashboard } from "./dashboard";

interface Cliente {
  nome: string;
  email: string;
}

interface Produto {
  nome: string;
  preco: string;
  estoque: number;
}

const redis = new Redis();
const NUM_CLIENTES = 5;

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const productNames = [
  "Camiseta Basica",
  "Camiseta Polo",
  "Sapato Esportivo",
  "Tenis Casual",
  "Mesa de Madeira",
  "Cadeira Gamer",
  'Monitor 24"',
  'Monitor 27"',
  "Teclado Mecanico",
  "Teclado Sem Fio",
  "Mouse Sem Fio",
  "Mouse Gamer",
  "Fone Bluetooth",
  "Fone Over-Ear",
  "Cafeteira Eletrica",
  "Micro-ondas 20L",
  "Air Fryer 4L",
  "Shampoo Anticaspa",
  "Sabonete Liquido",
  "Arroz Tipo 1",
  "Feijao Carioca",
  "Macarrao Espaguete",
  "Acucar Refinado",
  "Cerveja Lata 350ml",
];

function randomProductName(): string {
  const index = Math.floor(Math.random() * productNames.length);
  return productNames[index];
}

// Criar clientes automaticamente (1 vez)
async function criarClientesIniciais() {
  for (let id = 1; id <= NUM_CLIENTES; id++) {
    const cliente: Cliente = {
      nome: faker.person.fullName(),
      email: faker.internet.email(),
    };

    await redis.hset(`fastcard:clientes:${id}`, cliente);

    const msg = `Cliente criado - ${id} | ${cliente.nome}`;
    (global as any).registrarDashboardLog?.(msg);
  }
}

// Criar Produto
async function criarProduto() {
  const id = rand(1000, 9999);

  const produto: Produto = {
    nome: randomProductName(),
    preco: faker.commerce.price({ min: 10, max: 500 }),
    estoque: rand(5, 50),
  };

  await redis.hset(`fastcard:produtos:${id}`, produto);

  const msg = `Produto criado - ${id} | ${produto.nome} | R$${produto.preco}`;
  (global as any).registrarDashboardLog?.(msg);
}

// Simular Carrinho
async function adicionarAoCarrinho() {
  const clienteId = rand(1, NUM_CLIENTES);

  const produtoKeys = await redis.keys("fastcard:produtos:*");
  if (produtoKeys.length === 0) return;

  const produtoKey = produtoKeys[rand(0, produtoKeys.length - 1)];
  const produtoId = produtoKey.split(":")[2];
  const quantidade = rand(1, 3);

  await redis.hincrby(
    `fastcard:carrinho:cliente:${clienteId}`,
    produtoId,
    quantidade
  );

  const msg = `Cliente ${clienteId} adicionou ${quantidade}x do produto ${produtoId}`;
  (global as any).registrarDashboardLog?.(msg);
}

// Finalizar compra
async function finalizarCompra() {
  const clienteId = rand(1, NUM_CLIENTES);
  const key = `fastcard:carrinho:cliente:${clienteId}`;
  const ranking = "fastcard:ranking:vendas";

  const items = await redis.hgetall(key);
  const ids = Object.keys(items);

  if (ids.length === 0) return;

  for (const produtoId of ids) {
    const quantidade = parseInt(items[produtoId], 10);

    await redis.zincrby(ranking, quantidade, `fastcard:produtos:${produtoId}`);
  }

  await redis.del(key);

  const msg = `Cliente ${clienteId} finalizou uma compra`;
  (global as any).registrarDashboardLog?.(msg);
}

// Loop principal
async function loop() {
  const acao = rand(1, 10);

  if (acao <= 3) {
    await criarProduto();
  } else if (acao <= 8) {
    await adicionarAoCarrinho();
  } else {
    await finalizarCompra();
  }

  setTimeout(loop, rand(700, 1600));
}

async function main() {
  iniciarDashboard();
  await criarClientesIniciais();
  loop();
}

main();
