import Redis from "ioredis";
import blessed from "blessed";
import contrib from "blessed-contrib";

const redis = new Redis();

export function iniciarDashboard() {
  const screen = blessed.screen({
    smartCSR: true,
    title: "FastCard Dashboard",
  });

  const grid = new contrib.grid({ rows: 12, cols: 12, screen });

  const tabelaRanking = grid.set(0, 0, 6, 6, contrib.table, {
    keys: true,
    fg: "white",
    label: "📊 Ranking de Vendas",
    columnWidth: [30, 15],
  });

  const logBox = grid.set(0, 6, 12, 6, contrib.log, {
    fg: "green",
    selectedFg: "white",
    label: "📜 Eventos",
  });

  // Atualiza tabela do ranking
  async function atualizarRanking() {
    const ranking = await redis.zrevrange(
      "fastcard:ranking:vendas",
      0,
      -1,
      "WITHSCORES"
    );

    if (!ranking.length) {
      tabelaRanking.setData({
        headers: ["Produto", "Vendidos"],
        data: [["(sem vendas ainda)", "0"]],
      });

      screen.render();
      return;
    }

    const dados: any[] = [];

    for (let i = 0; i < ranking.length; i += 2) {
      const produtoKey = ranking[i];
      const qty = ranking[i + 1];
      const produtoId = produtoKey.split(":")[2];
      const produto = await redis.hgetall(`fastcard:produtos:${produtoId}`);

      dados.push([produto.nome || "-", qty]);
    }

    tabelaRanking.setData({
      headers: ["Produto", "Vendidos"],
      data: dados,
    });

    screen.render();
  }

  // Stream para logs
  function registrarLog(texto: string) {
    logBox.log(texto);
    screen.render();
  }

  // Atualizar ranking a cada 1.5s
  setInterval(atualizarRanking, 1000);

  // Expor uma função global para o simulador usar
  (global as any).registrarDashboardLog = registrarLog;

  // ESC para sair
  screen.key(["escape", "q", "C-c"], function () {
    return process.exit(0);
  });

  screen.render();
}
