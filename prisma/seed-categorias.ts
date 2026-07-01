import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Populando categorias...");

  // Limpar categorias existentes
  await db.categoria.deleteMany();

  const categorias = [
    {
      value: "MONITOR",
      label: "Monitores",
      labelSingular: "Monitor",
      icon: "Monitor",
      campos: JSON.stringify(["Polegadas", "Resolução", "Tipo de painel", "Conexões"]),
      builtin: true,
    },
    {
      value: "CPU",
      label: "CPUs / Desktops",
      labelSingular: "CPU",
      icon: "Cpu",
      campos: JSON.stringify(["Processador", "Memória RAM", "Armazenamento", "Sistema Operacional"]),
      builtin: true,
    },
    {
      value: "NOTEBOOK",
      label: "Notebooks",
      labelSingular: "Notebook",
      icon: "Laptop",
      campos: JSON.stringify(["Processador", "Memória RAM", "Armazenamento", "Tela", "Sistema Operacional"]),
      builtin: true,
    },
    {
      value: "TV",
      label: "Televisões",
      labelSingular: "TV",
      icon: "Tv",
      campos: JSON.stringify(["Polegadas", "Resolução", "Tipo", "Smart TV"]),
      builtin: true,
    },
    {
      value: "RACK",
      label: "Racks",
      labelSingular: "Rack",
      icon: "Server",
      campos: JSON.stringify(["Tamanho (U)", "Largura", "Ventilação", "Capacidade"]),
      builtin: true,
    },
    {
      value: "SERVIDOR",
      label: "Servidores",
      labelSingular: "Servidor",
      icon: "HardDrive",
      campos: JSON.stringify(["Processador", "Memória RAM", "Armazenamento", "Sistema Operacional", "Função"]),
      builtin: true,
    },
    {
      value: "IMPRESSORA",
      label: "Impressoras",
      labelSingular: "Impressora",
      icon: "Printer",
      campos: JSON.stringify(["Tipo", "Velocidade (ppm)", "Duplex", "Conectividade"]),
      builtin: true,
    },
    {
      value: "IMPRESSORA_ZEBRA",
      label: "Impressoras Térmicas Zebra",
      labelSingular: "Impressora Térmica Zebra",
      icon: "Printer",
      campos: JSON.stringify(["Modelo", "Resolução (dpi)", "Largura máxima", "Conectividade", "Uso"]),
      builtin: true,
    },
    {
      value: "SMARTPHONE",
      label: "Smartphones",
      labelSingular: "Smartphone",
      icon: "Smartphone",
      campos: JSON.stringify(["Armazenamento", "RAM", "Sistema Operacional", "Linha/Operadora"]),
      builtin: true,
    },
    {
      value: "TELEFONE_FIXO",
      label: "Telefones Fixos",
      labelSingular: "Telefone Fixo",
      icon: "Phone",
      campos: JSON.stringify(["Tipo", "Ramal", "Linhas", "Recursos"]),
      builtin: true,
    },
  ];

  for (const cat of categorias) {
    await db.categoria.create({ data: cat });
  }

  const total = await db.categoria.count();
  console.log(`✅ ${total} categorias criadas (10 built-in)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
