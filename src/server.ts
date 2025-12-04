import Redis from "ioredis";

async function main() {
  const redis = new Redis({
    host: "localhost",
    port: 6379,
  });

  redis.on("connect", () => {
    console.log("✅ Conectado ao Redis!");
  });

  redis.on("error", (err) => {
    console.error("❌ Erro ao conectar ao Redis:", err);
  });

  // Teste básico
  await redis.set("mensagemTeste", "Redis Funcionando!");
  const mensagem = await redis.get("mensagemTeste");

  console.log("Mensagem:", mensagem);

  redis.quit();
}

main();
