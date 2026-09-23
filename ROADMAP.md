# Roadmap — JobTrail

## Fase 1 — Backend: Domínio e CRUDs ✅ Concluída
- [x] Models `Empresa`, `Candidatura`, `HistoricoStatus`
- [x] DbContext, Migration `InitialCreate`
- [x] DTOs e Controllers de Empresas e Candidaturas (CRUD completo)
- [x] Endpoint dedicado de mudança de status com geração automática de histórico

## Fase 2 — Backend: Autenticação ✅ Concluída (2026-09-17)
- [x] Model `Usuario`, com Id, Nome, Email (único), SenhaHash, CriadoEm
- [x] Migration para a nova tabela (`AddUsuarioEAssociacaoComEmpresa`) e aplicada no banco local
- [x] Pacotes `BCrypt.Net-Next` e `Microsoft.AspNetCore.Authentication.JwtBearer` instalados
- [x] `TokenService` gerando JWT (claims NameIdentifier, Name, Email; expiração de 8h)
- [x] `AuthController` com `POST /register`, `POST /login`, `POST /logout` — senha sempre hasheada (BCrypt), mensagem de erro genérica no login, cookie HttpOnly/Secure/SameSite=Strict
- [x] Autenticação JWT configurada no `Program.cs`, lendo o token do cookie via `JwtBearerEvents.OnMessageReceived`
- [x] `UsuarioId` adicionado em `Empresa` (Candidatura filtrada indiretamente via `Empresa.UsuarioId`)
- [x] `EmpresasController` e `CandidaturasController` protegidos com `[Authorize]`, filtrando dados pelo usuário autenticado
- [x] Segredos JWT (`Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`) via User Secrets, mesmo padrão da connection string
- [x] Validado manualmente: acesso sem token (401), acesso cruzado a dado de outro usuário (404), tentativa de vincular candidatura a empresa alheia (400)
- [x] `GET /api/auth/me` (protegido) adicionado para o frontend restaurar a sessão a partir do cookie, já que o JS não consegue ler um cookie HttpOnly diretamente

## Fase 3 — Frontend (React + TypeScript) ✅ Concluída (2026-09-21)
- [x] Estrutura de rotas (`react-router-dom`)
- [x] Tela de Login/Cadastro — cadastro encadeia login automático (endpoint `/register` não gera sessão por design)
- [x] Infraestrutura de autenticação: `AuthContext`/`useAuth`, `RotaProtegida`, `httpClient` com `credentials: 'include'`
- [x] Proxy do Vite (`/api` → backend) para dev — necessário para o cookie `Secure + SameSite=Strict` funcionar entre `http://localhost:5173` e `https://localhost:7220` (documentado em `vite.config.ts`)
- [x] Fluxo de login/cadastro/logout validado ponta a ponta em navegador (Playwright headless), sem erros de console
- [x] Layout compartilhado (header + navegação) entre páginas protegidas
- [x] Cadastro e listagem de Empresas — validado em navegador: lista vazia, criação, ordenação alfabética, bloqueio de submit sem nome, persistência após reload
- [x] Listagem de Candidaturas (com filtro por status) — filtro aplicado no cliente (a API ainda não expõe esse parâmetro); validado manualmente
- [x] Formulário de criar/editar Candidatura — Empresa como `<select>` populado via `GET /empresas` (nunca texto livre); edição não permite trocar `EmpresaId` nem `Status`, refletindo `CandidaturaUpdateDto`; validado manualmente (criação vinculada a empresa e edição com campo de empresa travado)
- [x] Tela de detalhes da Candidatura com histórico de status — validado manualmente
- [x] Componente de mudança de status — dropdown + botão "Atualizar" (desabilitado quando o status escolhido já é o atual, evitando registro de histórico sem mudança real); após o `PATCH`, a tela recarrega o histórico via `GET` (o endpoint de status não devolve a lista); validado manualmente, incluindo data/hora da mudança
- [x] Responsividade básica — CSS puro, sem biblioteca (Tailwind fica reservado para a Fase 4): header com `flex-wrap`, tabelas envolvidas por um utilitário `.tabela-scroll` (`overflow-x: auto`) para o scroll ficar contido no bloco da tabela em vez de vazar a página, padding de página reduzido abaixo de 480px

## Fase 4 — Polimento e Portfólio
- [x] **Migração do banco de dados: SQL Server → PostgreSQL** (2026-09-22) — troca do provedor EF Core (`Microsoft.EntityFrameworkCore.SqlServer` → `Npgsql.EntityFrameworkCore.PostgreSQL`), `Program.cs` usando `UseNpgsql`, migrations antigas (específicas do SQL Server) apagadas e `InitialCreate` recriada para o Postgres. Motivação: abrir mais opções de hospedagem gratuita real para o deploy desta fase. Validado manualmente contra um banco Postgres local: registro, login, `/auth/me`, CRUD de Empresas/Candidaturas, mudança de status com histórico, e precisão decimal de `SalarioPretendido`/`SalarioOferecido` (`numeric(10,2)` — sem warning na geração da migration, graças ao `.HasPrecision()` já existente no `JobTrailDbContext`)
- [ ] Testes automatizados para lógica de negócio não-trivial (ex: mudança de status + geração de histórico)
- [ ] Revisão geral de Clean Code
- [x] **Decidir e implementar estratégia de cookie/CORS em produção** (2026-09-22) — **decidido: backend serve o frontend.** `vite.config.ts` gera o build direto em `backend/JobTrail.Api/wwwroot` (`build.outDir` + `emptyOutDir`); `Program.cs` serve esses arquivos com `UseDefaultFiles`/`UseStaticFiles` e usa `MapFallbackToFile("{*path:regex(^(?!api).*$)}", "index.html")` para o React Router assumir rotas client-side (ex: F5 em `/candidaturas/5`) sem engolir 404s reais de `/api/*`. Mantém `SameSite=Strict` sem nenhuma mudança na configuração do cookie já validada — front e back ficam acoplados num único serviço de deploy, o que cabe em qualquer free tier (Render/Railway/Fly.io) com um serviço só. Avaliado contra servir em domínios separados com `SameSite=None` — descartado pelo risco de bloqueio de cookie cross-site em Safari/Firefox (ITP). `wwwroot/` do backend adicionado ao `.gitignore` (é artefato de build, igual `dist/`). Validado manualmente: `/` serve o SPA, rota profunda cai no fallback (200, não 404), assets estáticos carregam, `/api/*` autenticado/não-autenticado continua igual, e uma rota de API inexistente ainda dá 404 de verdade. Fluxo de `npm run dev` (Vite + proxy) continua igual, sem mudança nenhuma — essa decisão afeta só o build de produção
- [x] **Preparação de deploy: Docker + ajustes de produção no backend** (2026-09-22) — `Dockerfile` multi-stage na raiz do repo (build do frontend → publish do backend → imagem final só com o runtime), necessário porque .NET não é runtime nativo do Render (só Node, Python, Ruby, Go, Rust, Elixir — confirmado na documentação oficial). `Program.cs` ganhou: `Database.Migrate()` automático na inicialização (o free tier do Render não dá acesso a shell no container, então não tem como rodar `dotnet ef database update` manualmente depois do deploy); `UseForwardedHeaders`, já que o load balancer do Render termina o HTTPS e repassa pro container em HTTP puro; e o container escuta na porta que o Render injeta via variável `PORT` (lida em runtime no `ENTRYPOINT`, não fixa). Validado localmente contra um banco novo no **Neon** (Postgres gerenciado, escolhido em vez do Postgres gratuito do próprio Render porque este expira em 30 dias — inviável para um link de portfólio permanente): a migração automática criou do zero todas as tabelas (`Usuarios`, `Empresas`, `Candidaturas`, `HistoricosStatus`, com índices) na primeira conexão, e `GET /api/candidaturas` sem login continuou retornando 401 como esperado
- [ ] Considerar Tailwind (ou outra lib de UI) para dar uma cara mais profissional antes do deploy, se sobrar tempo
- [x] README completo com screenshots — conteúdo escrito e commitado (9 seções); screenshots (`docs/screenshots/*.png`) e os dados reais da seção Autor (nome, LinkedIn, GitHub) ainda pendentes — hoje estão como placeholder
- [ ] Deploy real — decidido: **Render** (Web Service via Docker, free tier) + **Neon** (PostgreSQL gerenciado). Dockerfile e app já preparados e validados localmente contra o Neon (ver item acima); falta criar a conta no Render, configurar o Web Service e as variáveis de ambiente (`ConnectionStrings__JobTrailDb`, `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience`)
- [ ] Link do projeto ao vivo no README
