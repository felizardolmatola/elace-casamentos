# Elace Casamentos — Angular + TypeScript

O frontend está organizado em rotas Angular e componentes standalone TypeScript. As páginas HTML/JavaScript antigas foram removidas do diretório público e substituídas pelas rotas Angular:

- `/` página inicial
- `/login` autenticação
- `/registo` criação de conta
- `/fornecedores` catálogo de fornecedores
- `/criar-casamento` formulário de planeamento
- `/dashboard` área do casal
- `/dashboard-fornecedor` área do fornecedor
- `/admin/fornecedores` área administrativa

## Desenvolvimento

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

O backend Express/TypeScript permanece separado. Os formulários usam os endpoints `/api/auth/...` e `/api/casal/casamento`; confirme que o backend está ativo e que a configuração de API/CORS corresponde ao ambiente.
