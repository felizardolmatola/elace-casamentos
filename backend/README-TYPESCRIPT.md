# Backend TypeScript

O backend foi migrado de JavaScript para TypeScript (`.ts`). Os imports continuam com extensão `.js` para compatibilidade com a saída compilada pelo TypeScript em NodeNext.

## Executar em desenvolvimento

```bash
npm install
npm run dev
```

## Compilar e executar produção

```bash
npm run build
npm start
```

A compilação gera os ficheiros em `dist/`. Não edite manualmente os ficheiros compilados.
