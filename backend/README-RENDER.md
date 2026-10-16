# Enlace Casamentos — Backend

Backend Node.js + Express preparado para Render e Supabase PostgreSQL.

## Estrutura

- `server.js` — servidor Express
- `config/db.js` — conexão com Supabase
- `middlewares/auth.js` — autenticação JWT
- `routes/auth.js` — login
- `routes/casal.js` — casal e administração
- `routes/fornecedor.js` — fornecedores e administração
- `.env.example` — exemplo das variáveis

## Desenvolvimento local

1. Copie `.env.example` para `.env`.
2. Preencha `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.
3. Execute:

```bash
npm install
npm start
```

## Render

Crie um Web Service conectado ao repositório.

Build Command:

```bash
npm install
```

Start Command:

```bash
npm start
```

No Render, configure estas Environment Variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Não envie o arquivo `.env` para o GitHub.

## Observação importante

O banco Supabase precisa possuir as tabelas e colunas usadas pelas rotas. Este pacote não apaga nem cria automaticamente dados do banco.
