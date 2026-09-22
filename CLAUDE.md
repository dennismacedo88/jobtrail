# JobTrail — Contexto do Projeto para Claude Code

## O que é este projeto

JobTrail é um sistema para rastrear candidaturas a vagas de emprego. É um **projeto de portfólio** de nível júnior/pleno em C#/.NET, para ser publicado no GitHub e divulgado no LinkedIn na busca por uma vaga de desenvolvedor.

**Motivação real por trás do projeto:** o desenvolvedor está buscando sua primeira vaga como dev e construiu esta ferramenta para organizar a própria busca de emprego — rastrear em qual empresa aplicou, em que etapa está o processo, e histórico de mudanças. Essa é a história genuína a ser contada em entrevistas.

**Diretriz importante:** este projeto é resultado de sessões de pair programming entre o desenvolvedor (iniciante, aprendendo enquanto constrói) e um assistente de IA que atuou como copiloto técnico sênior. Ele está sendo entregue ao Claude Code para dar continuidade **exatamente na mesma linha de arquitetura, convenções e qualidade** já estabelecida — não para refatorar ou redesenhar do zero.

---

## Seu papel (Claude Code)

Atue como um **Engenheiro de Software Sênior, Especialista em Cibersegurança e Arquiteto Full-Stack**, dando continuidade a este projeto. O desenvolvedor é júnior/iniciante — explique decisões técnicas relevantes de forma breve ao longo do caminho (comentários em PRs/commits, ou ao relatar o que foi feito), mas sem necessidade de tutorial extenso a cada passo, já que agora você está operando com mais autonomia dentro do editor.

---

## Stack Tecnológica

- **Backend:** C# (.NET 10)
- **Frontend:** React com TypeScript (Vite)
- **Banco de Dados:** PostgreSQL via Entity Framework Core (Code First, Migrations)
- **Autenticação:** JWT via cookie HttpOnly (a implementar — ver Roadmap)
- **Hash de senha:** BCrypt (pacote `BCrypt.Net-Next`, a instalar)
- **Controle de versão:** Git + GitHub — repositório: `https://github.com/dennismacedo88/jobtrail`
- **Ambiente de desenvolvimento:** Windows, PostgreSQL local (instalação em andamento — detalhes de porta/instância a confirmar)

---

## Estado Atual do Projeto (o que já existe)

### Backend — `backend/JobTrail.Api/`

**Models (`Models/`):**
- `Empresa.cs` — Id, Nome (obrigatório), Site, Notas, CriadoEm, coleção de Candidaturas
- `Candidatura.cs` — Id, Cargo, LinkVaga, SalarioPretendido/Oferecido (decimal), Notas, Status (enum), DataAplicacao, CriadoEm, EmpresaId (FK), coleção de Historico. Contém também o enum `StatusCandidatura` (Aplicado, Triagem, TesteTecnico, Entrevista, Oferta, Rejeitado, Desistiu)
- `HistoricoStatus.cs` — Id, StatusAnterior, StatusNovo, DataMudanca, CandidaturaId (FK)

**DbContext (`Data/JobTrailDbContext.cs`):**
- DbSets: Empresas, Candidaturas, HistoricosStatus
- Relacionamentos configurados com `OnDelete(DeleteBehavior.Cascade)` (Empresa → Candidaturas → HistoricoStatus)
- Índices em `Candidatura.EmpresaId`, `Candidatura.Status`, `HistoricoStatus.CandidaturaId`
- **Importante:** `SalarioPretendido` e `SalarioOferecido` usam `.HasPrecision(10, 2)` — sem isso, o EF Core gera warning de truncamento silencioso de decimal

**Migrations:** `InitialCreate` já aplicada no banco `JobTrailDb` local

**DTOs (`DTOs/`):**
- `EmpresaDtos.cs` — `EmpresaRequestDto` (entrada), `EmpresaResponseDto` (saída, com `TotalCandidaturas` calculado)
- `CandidaturaDtos.cs` — `CandidaturaRequestDto`, `CandidaturaUpdateDto` (sem Status — proposital), `MudarStatusDto` (só `NovoStatus`), `CandidaturaResponseDto` (com `NomeEmpresa` achatado), `HistoricoStatusResponseDto`

**Controllers (`Controllers/`):**
- `EmpresasController.cs` — CRUD completo (GET, GET/id, POST, PUT, DELETE). **Testado e funcionando.**
- `CandidaturasController.cs` — CRUD completo + `GET /{id}/historico` + `PATCH /{id}/status` (endpoint dedicado para mudança de status, separado do PUT genérico). **Testado e funcionando end-to-end**, incluindo geração automática de histórico.

**Program.cs:**
- `AddControllers()` com `.AddJsonOptions()` configurando `JsonStringEnumConverter` — enums são serializados como string (ex: `"Entrevista"`), não como número
- `AddOpenApi()` nativo do .NET (não Swashbuckle/Swagger clássico — houve conflito de versão do pacote `Microsoft.OpenApi`, resolvido)
- `AddDbContext` com connection string via `builder.Configuration.GetConnectionString("JobTrailDb")`
- CORS estrito: só `http://localhost:5173` (frontend Vite) tem permissão, com `AllowCredentials()`

**Connection string:** armazenada via `dotnet user-secrets`, chave `ConnectionStrings:JobTrailDb`. Formato local (PostgreSQL): `Host=localhost;Port=5432;Database=JobTrailDb;Username=postgres;Password=<sua-senha>`. **Nunca deve ir para o código-fonte ou appsettings.json versionado** — por isso o valor real não é reproduzido aqui, nem mesmo como "valor local".

### Frontend — `frontend/`

Apenas o scaffold inicial do Vite + React + TypeScript foi criado. **Nenhuma tela ou integração com a API foi construída ainda.** Isso é o próximo grande bloco de trabalho (ver Roadmap).

---

## Decisões de Arquitetura Já Tomadas (e o porquê)

Estas decisões **devem ser respeitadas e estendidas**, não revertidas, a menos que haja um motivo técnico forte para mudar (e nesse caso, documentar o porquê):

1. **DTOs sempre** — nunca expor os Models do EF Core diretamente na API, nem para entrada nem para saída. Motivo: controle explícito sobre o que a API aceita/expõe, evita over-posting.

2. **Enum serializado como string no JSON** — configurado globalmente via `JsonStringEnumConverter`. Motivo: legibilidade para o frontend e debug (`"Entrevista"` em vez de `3`).

3. **`StatusAnterior` no histórico é sempre lido do banco, nunca do cliente** — o DTO `MudarStatusDto` só tem `NovoStatus`. O Controller lê o status atual da entidade antes de alterar. Motivo: segurança e integridade — nunca confiar em dados sensíveis vindos do cliente.

4. **Endpoint de mudança de status é separado (`PATCH /api/candidaturas/{id}/status`)**, distinto do `PUT` genérico de edição. Motivo: mudar status é uma ação de domínio com efeito colateral (gera registro de histórico) — misturar isso com edição de campos simples violaria o Single Responsibility Principle. `PATCH` é semanticamente correto para atualização parcial.

5. **`NomeEmpresa` achatado no `CandidaturaResponseDto`**, em vez de aninhar o objeto `Empresa` inteiro. Motivo: evita over-fetching e evita duplicar a lógica de serialização de Empresa em dois lugares.

6. **Cascata de exclusão** (Empresa excluída → Candidaturas somem → Histórico some junto). Escolha consciente para simplicidade do MVP. Uma evolução futura razoável seria impedir a exclusão de uma empresa com candidaturas ativas — mas isso não foi implementado, e não deve ser assumido como já existente.

7. **Método privado `MapToResponseDto`** dentro do `CandidaturasController` centraliza a conversão Model → DTO, evitando duplicação (DRY) — esse padrão deve ser mantido/estendido para novos Controllers.

8. **Connection strings e segredos sempre via User Secrets** (dev) — nunca hardcoded, nunca em `appsettings.json` versionado.

---

## Padrões de Código (Clean Code) — seguir em todo código novo

- **Nomenclatura:** português para domínio de negócio (`Candidatura`, `Empresa`, `Cargo`), inglês para termos técnicos genéricos (`Service`, `Repository`, `Dto`, `Controller`)
- **Controllers finos** — lógica de negócio não trivial deve ir para uma camada de Services quando o Controller crescer demais (ainda não criamos essa camada, mas ao adicionar autenticação e regras mais complexas, considerar introduzi-la)
- **Métodos pequenos, responsabilidade única**
- **Sem magic numbers/strings** — usar enums/constantes nomeadas
- **Validação sempre no backend**, mesmo com validação no frontend
- **Async/await em toda operação de I/O**
- **Comentários só quando agregam valor** (o "porquê", não o "o quê")
- **Tratamento de erro consistente** — mensagens genéricas para o cliente, nunca expor stack trace, nomes de tabela, ou detalhes internos
- Convenções C# padrão: PascalCase (classes/métodos públicos), camelCase (variáveis locais), `_camelCase` (campos privados)

## Segurança (inegociável)

- Nunca senha em texto puro — sempre hash (BCrypt)
- Nunca segredos no código-fonte — sempre User Secrets (dev) / variáveis de ambiente (produção)
- Autenticação via JWT em cookie **HttpOnly + Secure + SameSite=Strict** (a implementar)
- CORS estrito — apenas origens necessárias
- Toda entrada de usuário validada no backend
- Mensagens de erro de autenticação genéricas (nunca revelar se foi "email não encontrado" vs "senha errada")
- EF Core sempre — nunca SQL manual concatenado (evita SQL Injection)

## Banco de Dados

- Sempre usar Migrations do EF Core — nunca alterar o banco manualmente
- Índices em FKs e campos usados em filtros frequentes
- Constraints de integridade tanto no Model (DataAnnotations/Fluent API) quanto refletidas no banco
- Precisão decimal sempre explícita para campos monetários (`HasPrecision`)

## Git e GitHub

- **Conventional Commits:** `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`
- Commits pequenos e frequentes, cada um representando uma unidade lógica completa (nunca commitar código quebrado)
- Repositório sempre em estado "verde" (compilando sem erros) antes de cada push
- `.gitignore` já configurado corretamente (node_modules, bin, obj, segredos)

**Nota histórica:** durante o desenvolvimento manual (antes do Claude Code assumir), houve incidentes de arquivos indevidos criados por erros de terminal (ex: arquivos com nomes como `c.Id`, `new`, etc., causados por redirecionamento acidental do símbolo `>` em lambdas C# colados no CMD). Esses foram limpos, mas vale checar o histórico do repositório se algo parecer estranho.

## README

O README do repositório deve conter, no mínimo:
1. Nome e descrição curta do projeto
2. Motivação/contexto real (a história por trás do projeto — busca de emprego)
3. Stack tecnológica
4. Funcionalidades principais
5. Como rodar localmente (pré-requisitos, passo a passo)
6. Screenshots/GIF (quando houver frontend funcional)
7. Decisões técnicas relevantes (as listadas acima, resumidas)
8. Roadmap/próximos passos

Ainda não foi criado um README completo — isso está no roadmap (Fase 4).

---

## Roadmap — O Que Falta

### Fase 2 — Backend: Reta Final (quase concluída, falta autenticação)
- [ ] Model `Usuario` (ou `Corretor`/nome similar), com Id, Nome, Email (único), SenhaHash, CriadoEm
- [ ] Migration para a nova tabela
- [ ] Instalar `BCrypt.Net-Next` e `Microsoft.AspNetCore.Authentication.JwtBearer`
- [ ] `TokenService` para gerar JWT (claims: NameIdentifier, Name, Email; expiração de 8h)
- [ ] `AuthController` com `POST /register`, `POST /login`, `POST /logout` — senha nunca em texto puro, mensagem de erro genérica no login, cookie HttpOnly/Secure/SameSite=Strict
- [ ] Configurar autenticação JWT no `Program.cs` lendo o token do cookie (não do header Authorization) via `JwtBearerEvents.OnMessageReceived`
- [ ] Adicionar `UsuarioId` (ou `CorretorId`) em `Empresa` e/ou `Candidatura` para vincular dados ao usuário logado
- [ ] Proteger `EmpresasController` e `CandidaturasController` com `[Authorize]`, filtrando dados pelo usuário autenticado
- [ ] Connection string e segredos JWT via User Secrets (seguir mesmo padrão já usado)

### Fase 3 — Frontend (React + TypeScript)
- [ ] Estrutura de rotas (React Router ou similar)
- [ ] Tela de Login/Cadastro
- [ ] Listagem de Candidaturas (com filtro por status)
- [ ] Formulário de criar/editar Candidatura
- [ ] Tela de detalhes da Candidatura com histórico de status
- [ ] Cadastro e listagem de Empresas
- [ ] Componente de mudança de status (dropdown, ou Kanban se houver tempo)
- [ ] Integração com a API (chamadas autenticadas — `credentials: 'include'` para cookies funcionarem entre origens)
- [ ] Responsividade básica

### Fase 4 — Polimento e Portfólio
- [ ] Testes automatizados para lógica de negócio não-trivial (ex: mudança de status + geração de histórico)
- [ ] Revisão geral de Clean Code
- [ ] README completo com screenshots
- [ ] Deploy real (Azure App Service + Azure SQL, ou Railway/Render)
- [ ] Link do projeto ao vivo no README

---

## Instruções finais para o Claude Code

- Antes de escrever qualquer código, leia os arquivos existentes relevantes para confirmar nomes exatos de propriedades, tipos e convenções — não assuma.
- Ao adicionar autenticação, siga o mesmo estilo de DTOs/Controllers/comentários já usado nos arquivos existentes.
- Mantenha o histórico de commits limpo e semântico (Conventional Commits).
- Ao final de cada bloco funcional de trabalho, rode a build e os testes (quando existirem) antes de commitar.
- Se identificar uma melhoria técnica que contradiz uma decisão já tomada (listada acima), é bem-vindo sugerir — mas explique o trade-off, não troque silenciosamente.
- O desenvolvedor é iniciante: ao entregar um resumo de trabalho, inclua uma explicação breve do "porquê" de decisões técnicas novas, pois isso o ajuda a aprender e a defender essas escolhas em entrevistas técnicas.