# CheckSeg - Gestão de Manutenção Preventiva

**CheckSeg** é um sistema web MVP (Minimum Viable Product) focado na gestão simples e visual de manutenções preventivas para equipamentos empresariais (como Ar Condicionado, Compressores e Geradores).

Este projeto tem como objetivo inicial permitir o rápido cadastro de equipamentos instalados, e, por meio de inteligência no código, automatizar o cálculo de vencimento da próxima manutenção, ajudando na tomada de decisão rápida e evitando esquecimentos.

## 🚀 Funcionalidades Principais

*   **Cadastro Simplificado**: Formulário enxuto focado no essencial (Cliente, Tipo de Equipamento e Data de Instalação).
*   **Cálculo Automático de Ciclo de Vida**: Baseado no tipo do equipamento, o sistema calcula sozinho quando a próxima manutenção deve ser feita:
    *   *Ar Condicionado*: a cada 6 meses.
    *   *Compressor / Gerador*: a cada 12 meses.
*   **Dashboard de Status Semafórico**: Identificação visual rápida através de cores e cartões-filtro:
    *   🟢 **Em Dia**: Manutenção com mais de 30 dias para vencer.
    *   🟡 **Próximos**: Faltam 30 dias ou menos para o vencimento.
    *   🔴 **Vencidos**: A data ideal de manutenção já passou.
*   **Filtros Interativos Rápidos**: Ao clicar em um dos cartões do Dashboard, a tabela é filtrada instantaneamente sem recarregar a página.
*   **Persistência em Tempo Real (Offline)**: Todos os cadastros são salvos no `localStorage` do navegador.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído para ser leve, não exigindo configurações de servidor complexas neste estágio MVP:
*   **HTML5**
*   **CSS3** (com paleta de cores customizada)
*   **JavaScript (Vanilla JS)** (Lógica de datetimes, manipulação de DOM e Storage)
*   **Bootstrap 5.3.2** (Sistema de Grid e Cards responsivos)
*   **Google Fonts** (Inter)

## 💻 Como Rodar o Projeto (Localmente)

Como este é um projeto Frontend puro rodando com `localStorage`, não há necessidade de Node.js, Banco de Dados, ou instaladores.

1.  Clone este repositório ou baixe os arquivos para sua máquina:
    *   `index.html`
    *   `app.js`
    *   `styles.css`
2.  Abra o arquivo `index.html` em qualquer navegador web moderno de sua preferência (Google Chrome, Edge, Firefox, etc).
3.  **Pronto!** O sistema estará funcionando e seu navegador fará o papel de banco de dados temporário.

## 📁 Estrutura do Projeto

```
/gestao-manutencao
│
├── index.html       # Estrutura principal, formulários e tabela
├── styles.css       # Estilização customizada e personalização do Bootstrap
└── app.js           # Lógica do aplicativo, cálculo de datas e filtros do dashboard
```

## 🔄 Roadmap (Próximos Passos Sugeridos)

*   [ ] Integração com Back-End (ex: Firebase, Node.js + PostgreSQL) para ter os dados em nuvem.
*   [ ] Relatórios de custos e exportação em Excel.
*   [ ] Sistema de Autenticação (Login para múltiplos usuários técnicos).
*   [ ] Histórico de Ordens de Serviço (OS) atreladas a um equipamento.
*   [ ] Disparo de alertas via e-mail ou WhatsApp quando o status muda para "Próximo".
