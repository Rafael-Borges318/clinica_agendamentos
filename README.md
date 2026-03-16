https://clinica-ja.onrender.com
# JA Clínica – Sistema de Agendamentos Online

Este projeto foi desenvolvido com o objetivo de criar um sistema simples de agendamento online para uma clínica estética.

A aplicação permite que clientes escolham um serviço, selecionem uma data e visualizem os horários disponíveis para realizar o agendamento.  
Também possui um painel administrativo para visualizar os agendamentos realizados.

O sistema foi construído utilizando **React no front-end** e **Node.js com Express no back-end**, com banco de dados no **Supabase**.

---

# Funcionalidades

- Agendamento de serviços online
- Seleção de data e horários disponíveis
- Validação de horários no backend
- Painel administrativo para visualizar agendamentos
- Proteção de rota para acesso ao admin
- Integração com banco de dados
- Deploy na nuvem

---

# Tecnologias utilizadas

## Front-end
- React
- Vite
- JavaScript
- CSS

## Back-end
- Node.js
- Express

## Banco de dados
- Supabase

## Deploy
- Render

---

# Estrutura do projeto


front-end
├── src
│ ├── components
│ ├── pages
│ ├── App.jsx
│ └── main.jsx
├── public
└── index.html

back-end
├── routes
├── utils
└── server.js


---

# Rotas da aplicação

## Página inicial


/


Permite que o cliente escolha o serviço, selecione a data e visualize os horários disponíveis.

---

## Login administrativo


/admin-login


Página de acesso ao painel administrativo.

---

## Painel admin


/admin


Página para visualizar os agendamentos realizados.

---

# Como rodar o projeto localmente

### 1. Clonar o repositório


git clone https://github.com/Rafael-Borges318/clinica_agendamentos


---

### 2. Instalar dependências

Front-end:


npm install


Back-end:


npm install


---

### 3. Rodar o projeto

Front-end:


npm run dev


Back-end:


node server.js


---

# Observações

O sistema possui validação de horários para evitar conflitos de agendamento.

Os horários disponíveis são calculados no backend considerando:

- horário de funcionamento da clínica
- duração do serviço
- horários já reservados

---

# Autor

Rafael Borges de Souza Lima  
Estudante de Análise e Desenvolvimento de Sistemas
