# 💍 Elace Casamentos

🇬🇧 [English](README.md) · 🇵🇹 Português

Plataforma web para casais organizarem o casamento num só lugar: planeamento, marketplace de fornecedores e acompanhamento de pedidos.

> ### 🚧 Projeto em construção
> Este é um projeto **em desenvolvimento ativo**. A interface e a API já existem e funcionam em partes, mas várias funcionalidades ainda não estão ligadas entre si ou não estão implementadas. A secção [O que ainda falta](#-o-que-ainda-falta-implementar) explica, com transparência, o que está feito e o que não está.

---

## 📸 Pré-visualização

### Página inicial
![Página inicial](/frontend/src/assets/img/projeto/1.png)

### Ferramentas de planeamento
Doze ferramentas apresentadas como cartões: convidados, orçamento, checklist, calendário, fornecedores, local, convites, mapa de mesas, música, presentes, contratos e lua de mel.

![Ferramentas de planeamento](/frontend/src/assets/img/projeto/2.png)

### Fornecedores
Categorias de profissionais (fotografia e vídeo, decoração e flores, música e animação, buffet, espaços e bolos).

![Fornecedores](/frontend/src/assets/img/projeto/3.png)

### Entrar
![Login](/frontend/src/assets/img/projeto/4.png)

> As imagens de alguns cartões de fornecedores ainda são marcadores de posição cinzentos. Fazem parte do trabalho em curso.

---

## ✅ O que já funciona

**Frontend (Angular, componentes standalone)**
- Página inicial com secções de ferramentas e fornecedores
- Cabeçalho com navegação, pesquisa de fornecedores (atalho `/`) e histórico de pesquisas recentes
- Páginas de login, registo (casal ou fornecedor) e "criar casamento"
- Marketplace de fornecedores com pesquisa, filtro por categoria e cidade, e contacto por WhatsApp, telefone e email
- Três painéis: **casal**, **fornecedor** e **administrador**
  - Casal: checklist, orçamento e despesas, convidados e RSVP, mesas, equipa de fornecedores, cronograma, notas
  - Fornecedor: pedidos, serviços, calendário, finanças, perfil
  - Admin: casais, fornecedores, aprovações, comunicados, registo de ações

**Backend (Node.js + Express 5 + TypeScript + PostgreSQL/Supabase)**
- Autenticação com JWT e palavras-passe com hash (bcrypt), com perfis `casal`, `fornecedor` e `admin`
- Registo e login de casais e fornecedores
- CRUD de categorias, serviços, convidados e solicitações de orçamento
- Aprovação e reprovação de fornecedores pelo admin
- Notificações e alteração de palavra-passe
- Endpoint de saúde (`/api/health`) e CORS configurável

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | Angular (standalone components, Router, HttpClient), CSS |
| Backend | Node.js, Express 5, TypeScript, `tsx` |
| Base de dados | PostgreSQL (Supabase) com o cliente `postgres` |
| Autenticação | JWT (`jsonwebtoken`) + `bcryptjs` |
| Deploy do backend | Render |

## 📁 Estrutura

```
.
├── backend/
│   ├── server.ts            # entrada da API
│   ├── config/db.ts         # ligação ao PostgreSQL
│   ├── middlewares/auth.ts  # JWT e controlo de perfis
│   ├── controllers/         # lógica de autenticação
│   └── routes/              # auth, casal, fornecedor, categoria,
│                            # servico, solicitacao, convidado,
│                            # notificacao, admin
├── frontend/
│   └── src/
│       ├── main.ts          # rotas da aplicação
│       ├── app/             # componentes (home, marketplace, painéis...)
│       └── assets/img/      # imagens
└── docs/screenshots/        # imagens deste README
```

## 🚀 Como executar

### Backend
```bash
cd backend
npm install
cp .env.example .env     # preencher as variáveis abaixo
npm run dev              # desenvolvimento
# ou: npm run build && npm start
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL de ligação PostgreSQL (Supabase) |
| `JWT_SECRET` | Chave secreta longa e aleatória |
| `PORT` | Porta da API (por defeito `8080`) |
| `CORS_ORIGIN` | Origens permitidas, separadas por vírgula |

O esquema SQL da base de dados ainda não está no repositório (ver abaixo).

### Frontend
O frontend está em `frontend/src` e corre em `http://localhost:4200`. Os ficheiros de configuração do Angular (`package.json`, `angular.json`, `tsconfig`) ainda **não estão incluídos neste repositório**, por isso é preciso gerar o projeto com a Angular CLI e copiar `src/` para dentro dele.

## 🧭 O que ainda falta implementar

### 1. Ligar o frontend ao backend (prioridade máxima)
Hoje o backend e o frontend existem lado a lado, mas **quase não falam um com o outro**:

- **Os três painéis guardam tudo no `localStorage` do navegador.** Tarefas, despesas, convidados, mesas, pedidos, serviços, aprovações e comunicados não são gravados na base de dados. Se o utilizador limpar o navegador ou trocar de dispositivo, perde tudo. O backend já tem rotas para convidados, serviços, solicitações, notificações e admin, mas os painéis ainda não as usam.
- **O marketplace chama `/api/fornecedores`, mas a rota do backend é `/api/fornecedor`** (singular). A listagem real de fornecedores precisa de ser alinhada.
- **"Criar casamento" chama `POST /api/casal/casamento`, que não existe no backend.**
- O frontend usa caminhos relativos (`/api/...`). Falta um proxy no desenvolvimento ou uma variável de ambiente com o URL da API.

### 2. Funcionalidades de planeamento sem backend
Faltam tabelas e rotas para: **checklist de tarefas, orçamento e despesas, mapa de mesas, cronograma, lista de presentes, contratos e documentos, lua de mel, música e repertório, local da celebração** e **convites com envio e confirmação de presença** (RSVP). Na página inicial, vários destes cartões ainda levam apenas ao painel geral.

### 3. Fornecedores e marketplace
- Upload de fotografias (hoje só existe `foto_url`, sem armazenamento de ficheiros)
- Imagens reais para todas as categorias (algumas ainda são marcadores de posição)
- Galeria de trabalhos, avaliações e comentários
- Mapa de localização: a tabela tem `cidade` e `endereco`, mas não `latitude`/`longitude`
- Fluxo completo de pedido de orçamento, com resposta e conversa dentro da plataforma

### 4. Contas e segurança
- Recuperação de palavra-passe e verificação de email
- Limitação de tentativas de login (rate limiting) e validação mais rigorosa dos dados recebidos
- Revisão de permissões do perfil admin e de logs de auditoria no servidor (hoje o registo de ações do painel admin é local)

### 5. Qualidade e infraestrutura
- Ficheiros de configuração do Angular e scripts de build do frontend
- Script SQL do esquema e dados de exemplo (seed)
- Testes automáticos (backend e frontend)
- Documentação da API (por exemplo OpenAPI/Swagger)
- Deploy do frontend e pipeline de CI
- Limpeza técnica: remover os READMEs desatualizados do backend (referem ficheiros `.js`), mover o `i18n.ts` (é um script de navegador, não de servidor) e escolher um nome único para o produto (a interface usa "Elace" e o código do backend usa "Enlace")
- Internacionalização (PT/EN), acessibilidade e testes em ecrãs pequenos

## 🗺️ Roadmap sugerido

1. Alinhar rotas e ligar login, registo e marketplace à API real
2. Migrar convidados, serviços e solicitações dos painéis para o backend
3. Criar as tabelas e rotas de orçamento, checklist, mesas e cronograma
4. Upload de imagens, avaliações e notificações em tempo real
5. Testes, documentação da API e deploy completo
