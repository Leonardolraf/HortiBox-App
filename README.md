# 🥬 HortiBox

Sistema de gerenciamento para hortifrúti com frontend em React + Tailwind e backend em NestJS.

#
# Integrantes do grupo:
- Leonardo Rodrigues Amorim Filho - UC23101012
- Mario Eduardo Pereira de Sousa - UC23101279
- Matheus Figueiredo Silva - UC23100843
---

## 📁 Estrutura do Projeto

```
hortibox-app-1/
│
├── hortibox-api/     # Backend (NestJS)
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── hortibox-app/     # Frontend (React + Tailwind)
│   ├── package.json
│   ├── tailwind.config.js
│   └── ...
```

---

## 🚀 Tecnologias Utilizadas

### Backend (`hortibox-api`)
- [NestJS](https://nestjs.com/)
- TypeScript
- ESLint + Prettier
- HTTP test file: `requisiçΣes.http`

### Frontend (`hortibox-app`)
- React
- Tailwind CSS
- PostCSS

---

## 🛠️ Como Rodar o Projeto

### 1. Clonar o Repositório

```bash
git clone https://github.com/Leonardolraf/HortiBox-App
cd hortibox-app
```

---

### 2. Rodar o Backend

```bash
cd hortibox-api
npm install
cp .env.example .env  # Ajuste suas variáveis de ambiente
npm run start:dev
```

---

### 3. Rodar o Frontend

```bash
cd hortibox-app
npm install
npm run dev
```

---

## 📦 Scripts Importantes

### Backend

| Comando             | Ação                     |
| ------------------- | ------------------------ |
| `npm run start:dev` | Inicia o servidor NestJS |
| `npm run build`     | Compila o projeto        |

### Frontend

| Comando         | Ação                   |
| --------------- | ---------------------- |
| `npm run dev`   | Inicia o servidor Vite |
| `npm run build` | Gera build de produção |

---

## 🔐 Arquivo `.env`

Certifique-se de configurar o arquivo `.env` com as credenciais corretas para banco de dados, autenticação e outros serviços utilizados no backend.

---


