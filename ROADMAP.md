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

## Fase 3 — Frontend (React + TypeScript) 🔵 Em andamento
- [x] Estrutura de rotas (`react-router-dom`)
- [x] Tela de Login/Cadastro — cadastro encadeia login automático (endpoint `/register` não gera sessão por design)
- [x] Infraestrutura de autenticação: `AuthContext`/`useAuth`, `RotaProtegida`, `httpClient` com `credentials: 'include'`
- [x] Proxy do Vite (`/api` → backend) para dev — necessário para o cookie `Secure + SameSite=Strict` funcionar entre `http://localhost:5173` e `https://localhost:7220` (documentado em `vite.config.ts`)
- [x] Fluxo de login/cadastro/logout validado ponta a ponta em navegador (Playwright headless), sem erros de console
- [ ] Listagem de Candidaturas (com filtro por status)
- [ ] Formulário de criar/editar Candidatura
- [ ] Tela de detalhes da Candidatura com histórico de status
- [ ] Cadastro e listagem de Empresas
- [ ] Componente de mudança de status (dropdown, ou Kanban se houver tempo)
- [ ] Responsividade básica

## Fase 4 — Polimento e Portfólio
- [ ] Testes automatizados para lógica de negócio não-trivial (ex: mudança de status + geração de histórico)
- [ ] Revisão geral de Clean Code
- [ ] **Decidir estratégia de cookie/CORS em produção**: o proxy do Vite usado em dev (front e back "mesma origem" do ponto de vista do navegador) não existe em produção. Definir entre (a) servir front e back sob o mesmo domínio via proxy reverso, replicando o mesmo efeito, ou (b) domínios diferentes + `SameSite=None` e CORS explícito por origem
- [ ] Considerar Tailwind (ou outra lib de UI) para dar uma cara mais profissional antes do deploy, se sobrar tempo
- [ ] README completo com screenshots
- [ ] Deploy real (Azure App Service + Azure SQL, ou Railway/Render)
- [ ] Link do projeto ao vivo no README
