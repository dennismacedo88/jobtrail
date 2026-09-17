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

## Fase 3 — Frontend (React + TypeScript)
- [ ] Estrutura de rotas (React Router ou similar)
- [ ] Tela de Login/Cadastro
- [ ] Listagem de Candidaturas (com filtro por status)
- [ ] Formulário de criar/editar Candidatura
- [ ] Tela de detalhes da Candidatura com histórico de status
- [ ] Cadastro e listagem de Empresas
- [ ] Componente de mudança de status (dropdown, ou Kanban se houver tempo)
- [ ] Integração com a API (chamadas autenticadas — `credentials: 'include'` para cookies funcionarem entre origens)
- [ ] Responsividade básica

## Fase 4 — Polimento e Portfólio
- [ ] Testes automatizados para lógica de negócio não-trivial (ex: mudança de status + geração de histórico)
- [ ] Revisão geral de Clean Code
- [ ] README completo com screenshots
- [ ] Deploy real (Azure App Service + Azure SQL, ou Railway/Render)
- [ ] Link do projeto ao vivo no README
