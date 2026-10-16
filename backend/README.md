# Enlace Backend v2

Backend corrigido para trabalhar com o esquema PostgreSQL fornecido pelo projeto.

## Instalação

```bash
npm install
```

Crie `.env` a partir de `.env.example` e preencha:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (opcional)
- `CORS_ORIGIN` (opcional)

## Executar

```bash
npm start
```

## Rotas principais

- `POST /api/auth/login`
- `POST /api/auth/registar/casal`
- `POST /api/auth/registar/fornecedor`
- `GET /api/auth/me`
- `GET/PATCH /api/casal/me`
- `GET /api/fornecedor`
- `GET/PATCH /api/fornecedor/me`
- `GET /api/categorias`
- `GET/POST/PATCH/DELETE /api/servicos...`
- `GET/POST/PATCH /api/solicitacoes...`
- `GET/POST/PATCH/DELETE /api/convidados...`
- `GET/PATCH /api/notificacoes...`
- `GET /api/admin/...`

## Observação sobre mapas/rotas

A tabela fornecida tem `cidade` e `endereco`, mas não possui latitude/longitude. O backend não inventa coordenadas. Para uma API de mapas, adicione posteriormente `latitude` e `longitude` em `fornecedores` ou faça geocodificação do endereço.
