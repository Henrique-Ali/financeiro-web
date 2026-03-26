# 💰 Finanças App (Gestor Financeiro Pessoal)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

Um aplicativo moderno e responsivo para gestão financeira pessoal. Planejado para dar total controle sobre transações recorrentes, faturas de cartão de crédito e controle familiar de gastos.

## ✨ Funcionalidades

- **Gestão de Múltiplas Contas:** Controle de saldo de contas bancárias em um único lugar, com transferências entre contas e caixa físico.
- **Controle de Cartão de Crédito:** Lida de forma inteligente com Faturas, dias de Fechamento e Vencimento.
- **Transações Dinâmicas:** Adicione despesas e receitas, associe a Categorias, e defina Responsáveis (Membros da família).
- **Gastos Fixos Mensais:** Lançamento rápido de contas fixas e verificação de pagamentos pendentes no mês atual.
- **Dashboard Institucional:** Uma visão amigável das pendências financeiras e alertas para orçamentos extrapolados.
- **Autenticação Segura:** Autenticação baseada em JWT.

## 🚀 Como Executar o Projeto Localmente

1. Faça o clone deste repositório:
```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
```

2. Entre na pasta do projeto e instale as dependências:
```bash
npm install
```

3. Configure as Variáveis de Ambiente:
Copie o arquivo `.env.example` para `.env` e ajuste a URL com o seu backend local ou o oficial:
```env
VITE_API_BASE_URL=https://z6ogy2t70b.execute-api.sa-east-1.amazonaws.com
```

4. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse a aplicação no navegador em `http://localhost:5173`.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as ferramentas mais modernas do ecossistema React:
- **Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização e Layout:** [TailwindCSS 4](https://tailwindcss.com/)
- **Navegação:** [React Router DOM v7](https://reactrouter.com/)
- **Gráficos e Componentes:** [Recharts](https://recharts.org/) & [Lucide React](https://lucide.dev/)
- **Utilitários:** `date-fns` para manipulações de datas e `clsx`/`tailwind-merge` para classes condicionais.

---
Desenvolvido por **Henrique Ali**.
