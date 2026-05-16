<div align="center">

# JA Clínica — Sistema de Agendamentos Online

**Aplicação fullstack para agendamento de serviços em clínica estética, com painel administrativo, ficha de anamnese e controle de disponibilidade de horários.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)

🌐 **[clinica-ja.onrender.com](https://clinica-ja.onrender.com)**

</div>

---

## Sobre o projeto

O **JA Clínica** é um sistema de agendamento online desenvolvido para clínicas estéticas. O cliente acessa a plataforma, escolhe o serviço desejado, seleciona uma data e visualiza apenas os horários realmente disponíveis — sem conflitos e sem duplo agendamento. Ao finalizar, preenche uma ficha de anamnese vinculada ao serviço.

O administrador acessa um painel protegido por JWT para visualizar, filtrar e gerenciar todos os agendamentos.

---

## Screenshots

| Fluxo de agendamento | Painel administrativo |
|:---:|:---:|
| ![Agendamento](docs/img/agendamento.png) | ![Painel Admin](docs/img/painelAdmin.png) |

---

## Funcionalidades

### Cliente
- Escolha de serviço com exibição de duração e descrição
- Seleção de data com calendário
- Listagem de horários disponíveis calculados em tempo real
- Cadastro automático de cliente por número de telefone
- Preenchimento de ficha de anamnese vinculada ao serviço agendado

### Administrador
- Login protegido com JWT
- Painel com resumo de agendamentos do dia
- Filtros por data, serviço e status
- Modal de detalhes do cliente com histórico
- Proteção de rota no frontend e validação de token no backend

### Backend
- Validação de conflitos de horário server-side
- Rate limiting e proteção contra ataques comuns (Helmet, HPP)
- Validação de entrada com Zod
- Arquitetura em camadas (Controller → Service → Repository)

---

## Arquitetura

```
clinica_agendamentos/
├── front-end/                  # React + Vite
│   └── src/
│       ├── components/         # Componentes reutilizáveis
│       ├── pages/              # Páginas (Home, Admin, Login)
│       └── lib/                # Configuração de cliente HTTP
│
└── back-end/                   # Node.js + Express
    ├── server.js               # Entry point
    └── src/
        ├── app.js              # Express app, middlewares globais
        ├── config/             # Variáveis de ambiente (Zod)
        ├── routes/             # Definição de rotas
        ├── controllers/        # Recebe requisição, delega ao service
        ├── services/           # Regras de negócio
        ├── repositories/       # Acesso ao Supabase (PostgreSQL)
        ├── schemas/            # Schemas de validação Zod
        ├── middleware/         # Auth JWT, rate limit, error handler
        └── utils/              # Helpers (cálculo de horários, datas)
```

**Fluxo de dados:**  
`React → Express API (REST) → Supabase (PostgreSQL)`

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) com as tabelas criadas

### 1. Clonar o repositório

```bash
git clone https://github.com/Rafael-Borges318/clinica_agendamentos
cd clinica_agendamentos
```

### 2. Configurar variáveis de ambiente do back-end

```bash
cd back-end
cp .env.example .env
# Preencha os valores no .env conforme sua conta Supabase
```

### 3. Instalar dependências e rodar o back-end

```bash
# Na pasta back-end/
npm install
npm run dev
# API disponível em http://localhost:3000
```

### 4. Configurar e rodar o front-end

```bash
cd ../front-end
# Crie um .env com:  VITE_API_URL=http://localhost:3000
npm install
npm run dev
# App disponível em http://localhost:5173
```

---

## Variáveis de ambiente

Veja [back-end/.env.example](back-end/.env.example) para a lista completa de variáveis necessárias.

---

## Deploy

A aplicação está em produção no **Render** (free tier):

🌐 [https://clinica-ja.onrender.com](https://clinica-ja.onrender.com)

> _Nota: por estar no plano gratuito, o servidor pode levar ~30 segundos para acordar na primeira requisição._

---

## Autor

**Rafael Borges de Souza Lima**  
Estudante de Análise e Desenvolvimento de Sistemas  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rafael_Borges-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/rafael-borges-lima)
[![GitHub](https://img.shields.io/badge/GitHub-Rafael--Borges318-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Rafael-Borges318)
