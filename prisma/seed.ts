import { db } from "../src/lib/db";

async function main() {
  // Limpar dados antigos
  await db.movimentacao.deleteMany();
  await db.ativo.deleteMany();

  const now = new Date();
  const diasAtras = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date;
  };
  const anosAtras = (a: number) => {
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - a);
    return date;
  };

  const ativos = [
    // ===== MONITORES =====
    {
      numeroPatrimonio: "TI-MON-0001", numeroSerie: "SN-DELL-U2419-001", categoria: "MONITOR",
      marca: "Dell", modelo: "U2419H", status: "EM_USO",
      especificacoes: JSON.stringify({ Polegadas: "24", Resolução: "1920x1080", "Tipo de painel": "IPS", Conexões: "HDMI, DP, USB" }),
      localizacao: "Sala 302", responsavel: "Ana Paula Costa", setor: "Financeiro",
      dataAquisicao: anosAtras(2), valorAquisicao: 1450, fornecedor: "Dell Brasil", notaFiscal: "NF-10234",
      dataGarantia: anosAtras(-1), observacoes: "Monitor do posto de trabalho financeiro",
    },
    {
      numeroPatrimonio: "TI-MON-0002", numeroSerie: "SN-LG-27UK650-002", categoria: "MONITOR",
      marca: "LG", modelo: "27UK650", status: "EM_USO",
      especificacoes: JSON.stringify({ Polegadas: "27", Resolução: "3840x2160", "Tipo de painel": "IPS 4K", Conexões: "HDMI, DP" }),
      localizacao: "Sala 105", responsavel: "Carlos Eduardo Silva", setor: "Desenvolvimento",
      dataAquisicao: anosAtras(1), valorAquisicao: 2800, fornecedor: "Amazon", notaFiscal: "NF-20567",
      dataGarantia: anosAtras(-2), observacoes: "Monitor 4K para desenvolvimento",
    },
    {
      numeroPatrimonio: "TI-MON-0003", numeroSerie: "SN-SAMSUNG-S24R-003", categoria: "MONITOR",
      marca: "Samsung", modelo: "S24R350", status: "EM_ESTOQUE",
      especificacoes: JSON.stringify({ Polegadas: "24", Resolução: "1920x1080", "Tipo de painel": "IPS" }),
      localizacao: "Almoxarifado TI", responsavel: null, setor: "TI",
      dataAquisicao: diasAtras(30), valorAquisicao: 1200, fornecedor: "Dell Brasil", notaFiscal: "NF-30998",
      dataGarantia: anosAtras(-3), observacoes: "Reserva técnica",
    },
    {
      numeroPatrimonio: "TI-MON-0004", numeroSerie: "SN-DELL-P2422-004", categoria: "MONITOR",
      marca: "Dell", modelo: "P2422H", status: "EM_MANUTENCAO",
      especificacoes: JSON.stringify({ Polegadas: "24", Resolução: "1920x1080", Conexões: "HDMI, DP, USB-C" }),
      localizacao: "Assistência Técnica", responsavel: null, setor: "TI",
      dataAquisicao: anosAtras(3), valorAquisicao: 1350, fornecedor: "Dell Brasil", notaFiscal: "NF-10001",
      observacoes: "Tela com flicker, enviado para reparo",
    },

    // ===== CPUs / DESKTOPS =====
    {
      numeroPatrimonio: "TI-CPU-0001", numeroSerie: "SN-DELL-OPTI-001", categoria: "CPU",
      marca: "Dell", modelo: "OptiPlex 7090 SFF", status: "EM_USO",
      especificacoes: JSON.stringify({ Processador: "Intel Core i7-11700", "Memória RAM": "16GB DDR4", Armazenamento: "512GB SSD", "Sistema Operacional": "Windows 11 Pro" }),
      localizacao: "Sala 302", responsavel: "Ana Paula Costa", setor: "Financeiro",
      dataAquisicao: anosAtras(2), valorAquisicao: 5200, fornecedor: "Dell Brasil", notaFiscal: "NF-10240",
      dataGarantia: anosAtras(-1), observacoes: "Desktop financeiro principal",
    },
    {
      numeroPatrimonio: "TI-CPU-0002", numeroSerie: "SN-HP-ELITE-002", categoria: "CPU",
      marca: "HP", modelo: "EliteDesk 800 G6", status: "EM_USO",
      especificacoes: JSON.stringify({ Processador: "Intel Core i5-10500", "Memória RAM": "8GB DDR4", Armazenamento: "256GB SSD", "Sistema Operacional": "Windows 11 Pro" }),
      localizacao: "Recepção", responsavel: "Marcia Lima", setor: "Administrativo",
      dataAquisicao: anosAtras(3), valorAquisicao: 4100, fornecedor: "HP Brasil", notaFiscal: "NF-11002",
      dataGarantia: anosAtras(0), observacoes: "Computador da recepção",
    },
    {
      numeroPatrimonio: "TI-CPU-0003", numeroSerie: "SN-DELL-OPTI-003", categoria: "CPU",
      marca: "Dell", modelo: "OptiPlex 3090 MT", status: "EM_ESTOQUE",
      especificacoes: JSON.stringify({ Processador: "Intel Core i3-10100", "Memória RAM": "8GB DDR4", Armazenamento: "1TB HDD", "Sistema Operacional": "Windows 11 Pro" }),
      localizacao: "Almoxarifado Ti", responsavel: null, setor: "TI",
      dataAquisicao: diasAtras(15), valorAquisicao: 3200, fornecedor: "Dell Brasil", notaFiscal: "NF-30990",
      observacoes: "Reserva para substituição",
    },

    // ===== NOTEBOOKS =====
    {
      numeroPatrimonio: "TI-NOT-0001", numeroSerie: "SN-DELL-LAT-001", categoria: "NOTEBOOK",
      marca: "Dell", modelo: "Latitude 5420", status: "EM_USO",
      especificacoes: JSON.stringify({ Processador: "Intel Core i7-1165G7", "Memória RAM": "16GB", Armazenamento: "512GB SSD", Tela: "14\"", "Sistema Operacional": "Windows 11 Pro" }),
      localizacao: "Sala 105", responsavel: "Carlos Eduardo Silva", setor: "Desenvolvimento",
      dataAquisicao: anosAtras(1), valorAquisicao: 7800, fornecedor: "Dell Brasil", notaFiscal: "NF-20560",
      dataGarantia: anosAtras(-2), observacoes: "Notebook corporativo dev",
    },
    {
      numeroPatrimonio: "TI-NOT-0002", numeroSerie: "SN-LENOVO-TP-002", categoria: "NOTEBOOK",
      marca: "Lenovo", modelo: "ThinkPad T14 Gen2", status: "EM_USO",
      especificacoes: JSON.stringify({ Processador: "AMD Ryzen 7 5850U", "Memória RAM": "32GB", Armazenamento: "1TB SSD", Tela: "14\"", "Sistema Operacional": "Ubuntu 22.04" }),
      localizacao: "Sala 110", responsavel: "Renata Souza", setor: "Desenvolvimento",
      dataAquisicao: anosAtras(2), valorAquisicao: 9200, fornecedor: "Lenovo Brasil", notaFiscal: "NF-18001",
      dataGarantia: anosAtras(-1), observacoes: "Notebook sênior dev",
    },
    {
      numeroPatrimonio: "TI-NOT-0003", numeroSerie: "SN-DELL-LAT-003", categoria: "NOTEBOOK",
      marca: "Dell", modelo: "Latitude 3520", status: "EM_ESTOQUE",
      especificacoes: JSON.stringify({ Processador: "Intel Core i5-1135G7", "Memória RAM": "8GB", Armazenamento: "256GB SSD", Tela: "15.6\"" }),
      localizacao: "Almoxarifado Ti", responsavel: null, setor: "TI",
      dataAquisicao: diasAtras(45), valorAquisicao: 5200, fornecedor: "Dell Brasil", notaFiscal: "NF-30950",
      observacoes: "Reserva para novos colaboradores",
    },
    {
      numeroPatrimonio: "TI-NOT-0004", numeroSerie: "SN-APPLE-MBP-004", categoria: "NOTEBOOK",
      marca: "Apple", modelo: "MacBook Pro 14 M2", status: "EM_USO",
      especificacoes: JSON.stringify({ Processador: "Apple M2 Pro", "Memória RAM": "16GB", Armazenamento: "512GB SSD", Tela: "14\"", "Sistema Operacional": "macOS Sonoma" }),
      localizacao: "Sala 108", responsavel: "Pedro Almeida", setor: "Design",
      dataAquisicao: anosAtras(1), valorAquisicao: 18500, fornecedor: "Apple Store", notaFiscal: "NF-20600",
      dataGarantia: anosAtras(-1), observacoes: "Notebook para design gráfico",
    },

    // ===== TVs =====
    {
      numeroPatrimonio: "TI-TV-0001", numeroSerie: "SN-SAMSUNG-TV-001", categoria: "TV",
      marca: "Samsung", modelo: "QN55Q60B", status: "EM_USO",
      especificacoes: JSON.stringify({ Polegadas: "55", Resolução: "4K UHD", Tipo: "QLED", "Smart TV": "Sim" }),
      localizacao: "Sala de Reuniões 1", responsavel: null, setor: "Diretoria",
      dataAquisicao: anosAtras(2), valorAquisicao: 4200, fornecedor: "Magazine Luiza", notaFiscal: "NF-10050",
      observacoes: "TV da sala de reuniões principal",
    },
    {
      numeroPatrimonio: "TI-TV-0002", numeroSerie: "SN-LG-TV-002", categoria: "TV",
      marca: "LG", modelo: "50UQ8050", status: "EM_USO",
      especificacoes: JSON.stringify({ Polegadas: "50", Resolução: "4K UHD", Tipo: "LED", "Smart TV": "Sim" }),
      localizacao: "Auditório", responsavel: null, setor: "RH",
      dataAquisicao: anosAtras(1), valorAquisicao: 3100, fornecedor: "Amazon", notaFiscal: "NF-20580",
      observacoes: "TV do auditório para apresentações",
    },

    // ===== RACKS =====
    {
      numeroPatrimonio: "TI-RACK-0001", numeroSerie: "SN-RACK-001", categoria: "RACK",
      marca: "Cinanet", modelo: "Rack 12U 19\"", status: "EM_USO",
      especificacoes: JSON.stringify({ "Tamanho (U)": "12U", Largura: "19 polegadas", Ventilação: "Exaustor ativo", Capacidade: "12 unidades" }),
      localizacao: "Data Center", responsavel: "Roberto Mendes", setor: "TI",
      dataAquisicao: anosAtras(4), valorAquisicao: 1800, fornecedor: "Cinanet", notaFiscal: "NF-05001",
      observacoes: "Rack principal do data center",
    },
    {
      numeroPatrimonio: "TI-RACK-0002", numeroSerie: "SN-RACK-002", categoria: "RACK",
      marca: "Intelbras", modelo: "Rack 6U 19\"", status: "EM_ESTOQUE",
      especificacoes: JSON.stringify({ "Tamanho (U)": "6U", Largura: "19 polegadas", Ventilação: "Passiva", Capacidade: "6 unidades" }),
      localizacao: "Almoxarifado Ti", responsavel: null, setor: "TI",
      dataAquisicao: anosAtras(1), valorAquisicao: 950, fornecedor: "Intelbras", notaFiscal: "NF-20590",
      observacoes: "Rack reserva",
    },

    // ===== SERVIDORES =====
    {
      numeroPatrimonio: "TI-SRV-0001", numeroSerie: "SN-DELL-PE-001", categoria: "SERVIDOR",
      marca: "Dell", modelo: "PowerEdge R650", status: "EM_USO",
      especificacoes: JSON.stringify({ Processador: "Intel Xeon Silver 4310", "Memória RAM": "64GB ECC", Armazenamento: "2x 1TB SSD RAID1", "Sistema Operacional": "VMware ESXi 7", Função: "Virtualização" }),
      localizacao: "Data Center", responsavel: "Roberto Mendes", setor: "TI",
      dataAquisicao: anosAtras(2), valorAquisicao: 32000, fornecedor: "Dell Brasil", notaFiscal: "NF-10100",
      dataGarantia: anosAtras(-3), observacoes: "Servidor de virtualização principal",
    },
    {
      numeroPatrimonio: "TI-SRV-0002", numeroSerie: "SN-DELL-PE-002", categoria: "SERVIDOR",
      marca: "Dell", modelo: "PowerEdge R450", status: "EM_USO",
      especificacoes: JSON.stringify({ Processador: "Intel Xeon E-2336", "Memória RAM": "32GB ECC", Armazenamento: "2x 480GB SSD RAID1", "Sistema Operacional": "Windows Server 2022", Função: "File Server / AD" }),
      localizacao: "Data Center", responsavel: "Roberto Mendes", setor: "TI",
      dataAquisicao: anosAtras(1), valorAquisicao: 21000, fornecedor: "Dell Brasil", notaFiscal: "NF-20600",
      dataGarantia: anosAtras(-3), observacoes: "Servidor de domínio e arquivos",
    },
    {
      numeroPatrimonio: "TI-SRV-0003", numeroSerie: "SN-HP-DL-003", categoria: "SERVIDOR",
      marca: "HP", modelo: "ProLiant DL360 Gen10", status: "EM_MANUTENCAO",
      especificacoes: JSON.stringify({ Processador: "Intel Xeon Gold 6230", "Memória RAM": "128GB ECC", Armazenamento: "8x 2TB SAS", "Sistema Operacional": "Linux Ubuntu Server", Função: "Banco de Dados" }),
      localizacao: "Assistência Técnica", responsavel: null, setor: "TI",
      dataAquisicao: anosAtras(4), valorAquisicao: 45000, fornecedor: "HP Brasil", notaFiscal: "NF-05200",
      observacoes: "Fonte queimada, em reparo na HP",
    },

    // ===== IMPRESSORAS =====
    {
      numeroPatrimonio: "TI-IMP-0001", numeroSerie: "SN-HP-LJ-001", categoria: "IMPRESSORA",
      marca: "HP", modelo: "LaserJet Pro M404dn", status: "EM_USO",
      especificacoes: JSON.stringify({ Tipo: "Laser Monocromática", "Velocidade (ppm)": "38", Duplex: "Automático", Conectividade: "Ethernet, USB" }),
      localizacao: "Sala 200", responsavel: null, setor: "Administrativo",
      dataAquisicao: anosAtras(2), valorAquisicao: 1850, fornecedor: "HP Brasil", notaFiscal: "NF-10090",
      observacoes: "Impressora de rede do andar 2",
    },
    {
      numeroPatrimonio: "TI-IMP-0002", numeroSerie: "SN-EPSON-WF-002", categoria: "IMPRESSORA",
      marca: "Epson", modelo: "WorkForce WF-C5790", status: "EM_USO",
      especificacoes: JSON.stringify({ Tipo: "Jato de Tinta Colorida", "Velocidade (ppm)": "20", Duplex: "Automático", Conectividade: "Wi-Fi, Ethernet, USB" }),
      localizacao: "Sala 300", responsavel: null, setor: "Financeiro",
      dataAquisicao: anosAtras(1), valorAquisicao: 2100, fornecedor: "Epson Brasil", notaFiscal: "NF-20570",
      observacoes: "Impressora colorida do financeiro",
    },
    {
      numeroPatrimonio: "TI-IMP-0003", numeroSerie: "SN-HP-MFP-003", categoria: "IMPRESSORA",
      marca: "HP", modelo: "LaserJet Pro MFP M428fdw", status: "EM_ESTOQUE",
      especificacoes: JSON.stringify({ Tipo: "Laser Multifuncional", "Velocidade (ppm)": "40", Duplex: "Automático", Conectividade: "Wi-Fi, Ethernet, USB" }),
      localizacao: "Almoxarifado Ti", responsavel: null, setor: "TI",
      dataAquisicao: diasAtras(60), valorAquisicao: 3200, fornecedor: "HP Brasil", notaFiscal: "NF-30910",
      observacoes: "Reserva técnica multifuncional",
    },

    // ===== IMPRESSORAS ZEBRA =====
    {
      numeroPatrimonio: "TI-ZEB-0001", numeroSerie: "SN-ZEBRA-GK420-001", categoria: "IMPRESSORA_ZEBRA",
      marca: "Zebra", modelo: "GK420t", status: "EM_USO",
      especificacoes: JSON.stringify({ Modelo: "GK420t (Transferência Térmica)", "Resolução (dpi)": "203", "Largura máxima": "4 polegadas", Conectividade: "USB, Serial, Ethernet", Uso: "Etiquetas de expedição" }),
      localizacao: "Expedição", responsavel: "José Santos", setor: "Logística",
      dataAquisicao: anosAtras(3), valorAquisicao: 2800, fornecedor: "Zebra Brasil", notaFiscal: "NF-08050",
      observacoes: "Impressora de etiquetas da expedição",
    },
    {
      numeroPatrimonio: "TI-ZEB-0002", numeroSerie: "SN-ZEBRA-ZD420-002", categoria: "IMPRESSORA_ZEBRA",
      marca: "Zebra", modelo: "ZD420t", status: "EM_USO",
      especificacoes: JSON.stringify({ Modelo: "ZD420t (Transferência Térmica)", "Resolução (dpi)": "203", "Largura máxima": "4 polegadas", Conectividade: "USB, Wi-Fi, Bluetooth", Uso: "Etiquetas de código de barras" }),
      localizacao: "Almoxarado Produção", responsavel: "Fernanda Rocha", setor: "Produção",
      dataAquisicao: anosAtras(1), valorAquisicao: 3500, fornecedor: "Zebra Brasil", notaFiscal: "NF-20620",
      observacoes: "Impressora de etiquetas de produto",
    },
    {
      numeroPatrimonio: "TI-ZEB-0003", numeroSerie: "SN-ZEBRA-ZD620-003", categoria: "IMPRESSORA_ZEBRA",
      marca: "Zebra", modelo: "ZD620t", status: "EM_ESTOQUE",
      especificacoes: JSON.stringify({ Modelo: "ZD620t", "Resolução (dpi)": "300", "Largura máxima": "4 polegadas", Conectividade: "USB, Ethernet, Wi-Fi", Uso: "Etiquetas de alta resolução" }),
      localizacao: "Almoxarifado Ti", responsavel: null, setor: "TI",
      dataAquisicao: diasAtras(20), valorAquisicao: 4200, fornecedor: "Zebra Brasil", notaFiscal: "NF-30980",
      observacoes: "Reserva técnica alta resolução",
    },

    // ===== SMARTPHONES =====
    {
      numeroPatrimonio: "TI-SMP-0001", numeroSerie: "IMEI-350123456789012", categoria: "SMARTPHONE",
      marca: "Samsung", modelo: "Galaxy A54 5G", status: "EM_USO",
      especificacoes: JSON.stringify({ Armazenamento: "128GB", RAM: "8GB", "Sistema Operacional": "Android 14", "Linha/Operadora": "Vivo Corporativo" }),
      localizacao: "Com o colaborador", responsavel: "Mariana Ferreira", setor: "Comercial",
      dataAquisicao: anosAtras(1), valorAquisicao: 2400, fornecedor: "Vivo", notaFiscal: "NF-20500",
      observacoes: "Celular corporativo do comercial",
    },
    {
      numeroPatrimonio: "TI-SMP-0002", numeroSerie: "IMEI-350987654321098", categoria: "SMARTPHONE",
      marca: "Apple", modelo: "iPhone 13", status: "EM_USO",
      especificacoes: JSON.stringify({ Armazenamento: "128GB", RAM: "4GB", "Sistema Operacional": "iOS 17", "Linha/Operadora": "Claro Corporativo" }),
      localizacao: "Com o colaborador", responsavel: "Diretor João Batista", setor: "Diretoria",
      dataAquisicao: anosAtras(2), valorAquisicao: 5500, fornecedor: "Claro", notaFiscal: "NF-10150",
      observacoes: "Celular da diretoria",
    },
    {
      numeroPatrimonio: "TI-SMP-0003", numeroSerie: "IMEI-350555444333222", categoria: "SMARTPHONE",
      marca: "Samsung", modelo: "Galaxy A14", status: "EM_ESTOQUE",
      especificacoes: JSON.stringify({ Armazenamento: "64GB", RAM: "4GB", "Sistema Operacional": "Android 13", "Linha/Operadora": "Não ativado" }),
      localizacao: "Almoxarifado Ti", responsavel: null, setor: "TI",
      dataAquisicao: diasAtras(40), valorAquisicao: 1300, fornecedor: "Vivo", notaFiscal: "NF-30940",
      observacoes: "Reserva para novo colaborador",
    },

    // ===== TELEFONES FIXOS =====
    {
      numeroPatrimonio: "TI-TLF-0001", numeroSerie: "SN-INT-001", categoria: "TELEFONE_FIXO",
      marca: "Intelbras", modelo: "Tie Fighter 60", status: "EM_USO",
      especificacoes: JSON.stringify({ Tipo: "Ramal IP", Ramal: "2001", Linhas: "1 linha", Recursos: "Viva-voz, identificador" }),
      localizacao: "Recepção", responsavel: "Marcia Lima", setor: "Administrativo",
      dataAquisicao: anosAtras(3), valorAquisicao: 380, fornecedor: "Intelbras", notaFiscal: "NF-07001",
      observacoes: "Ramal da recepção",
    },
    {
      numeroPatrimonio: "TI-TLF-0002", numeroSerie: "SN-PAN-002", categoria: "TELEFONE_FIXO",
      marca: "Panasonic", modelo: "KX-TS580", status: "EM_USO",
      especificacoes: JSON.stringify({ Tipo: "Analógico", Ramal: "2100", Linhas: "2 linhas", Recursos: "Viva-voz, memória" }),
      localizacao: "Sala 305", responsavel: "Paulo Henrique", setor: "RH",
      dataAquisicao: anosAtras(5), valorAquisicao: 250, fornecedor: "Panasonic", notaFiscal: "NF-03001",
      observacoes: "Telefone fixo do RH",
    },
    {
      numeroPatrimonio: "TI-TLF-0003", numeroSerie: "SN-INT-003", categoria: "TELEFONE_FIXO",
      marca: "Intelbras", modelo: "Tie Fighter 60", status: "EM_ESTOQUE",
      especificacoes: JSON.stringify({ Tipo: "Ramal IP", Linhas: "1 linha", Recursos: "Viva-voz, identificador" }),
      localizacao: "Almoxarifado Ti", responsavel: null, setor: "TI",
      dataAquisicao: anosAtras(1), valorAquisicao: 380, fornecedor: "Intelbras", notaFiscal: "NF-20560",
      observacoes: "Reserva técnica",
    },
  ];

  console.log(`Inserindo ${ativos.length} ativos...`);

  for (const ativo of ativos) {
    const created = await db.ativo.create({ data: ativo });

    // Criar movimentação de entrada em estoque para todos
    await db.movimentacao.create({
      data: {
        ativoId: created.id,
        tipo: "ENTRADA_ESTOQUE",
        descricao: `Entrada do ativo no patrimônio. NF: ${ativo.notaFiscal ?? "N/A"}`,
        localizacaoNova: "Almoxarifado Ti",
        data: ativo.dataAquisicao ?? new Date(),
        usuario: "Sistema (Seed)",
      },
    });

    // Se está em uso, criar movimentação de atribuição
    if (ativo.status === "EM_USO" && ativo.responsavel) {
      await db.movimentacao.create({
        data: {
          ativoId: created.id,
          tipo: "ATRIBUICAO",
          descricao: `Atribuído a ${ativo.responsavel}`,
          responsavelNovo: ativo.responsavel,
          localizacaoNova: ativo.localizacao,
          data: diasAtras(Math.floor(Math.random() * 200) + 5),
          usuario: "Roberto Mendes",
        },
      });
    }

    // Se está em manutenção, criar movimentação
    if (ativo.status === "EM_MANUTENCAO") {
      await db.movimentacao.create({
        data: {
          ativoId: created.id,
          tipo: "MANUTENCAO",
          descricao: `Enviado para manutenção: ${ativo.observacoes ?? ""}`,
          localizacaoAnterior: ativo.localizacao,
          localizacaoNova: "Assistência Técnica",
          data: diasAtras(Math.floor(Math.random() * 20) + 1),
          usuario: "Roberto Mendes",
        },
      });
    }
  }

  const totalAtivos = await db.ativo.count();
  const totalMov = await db.movimentacao.count();
  console.log(`✅ Seed concluído: ${totalAtivos} ativos e ${totalMov} movimentações`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
