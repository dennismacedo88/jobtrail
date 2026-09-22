# JobTrail

Sistema para rastrear candidaturas a vagas de emprego — cadastre as empresas para as quais você aplicou, acompanhe o status de cada candidatura (Aplicado, Triagem, Teste Técnico, Entrevista, Oferta, Rejeitado, Desistiu) e veja o histórico completo de mudanças.

## Sobre o projeto

Comecei a buscar minha primeira vaga como desenvolvedor e, no meio do processo, percebi que estava perdendo o controle de quantas empresas eu já tinha aplicado, em que etapa cada processo estava e há quanto tempo. Em vez de usar uma planilha, decidi construir minha própria ferramenta — e aproveitar o processo de construção como prova prática do que eu sei fazer.

O JobTrail nasceu dessa necessidade real: é o sistema que uso para organizar a minha própria busca de emprego, e é também o projeto que uso para mostrar meu trabalho como desenvolvedor.

## Funcionalidades

- Cadastro e login de usuário, com sessão via JWT em cookie `HttpOnly`
- Cadastro e listagem de empresas
- Cadastro, edição e listagem de candidaturas, vinculadas a uma empresa
- Filtro de candidaturas por status
- Mudança de status de uma candidatura, com geração automática de histórico
- Tela de detalhe da candidatura com o histórico completo de mudanças de status
- Cada usuário só enxerga os próprios dados

## Screenshots

**Login**
![Tela de login](docs/screenshots/login.png)

**Listagem de candidaturas, com filtro por status**
![Listagem de candidaturas](docs/screenshots/candidaturas.png)

**Formulário de criar/editar candidatura**
![Formulário de candidatura](docs/screenshots/candidatura-form.png)

**Detalhe da candidatura, com histórico de status**
![Detalhe da candidatura](docs/screenshots/candidatura-detalhe.png)

## Stack tecnológica

**Backend**
- C# / .NET 10
- Entity Framework Core (Code First, Migrations)
- PostgreSQL
- Autenticação JWT via cookie `HttpOnly` + `Secure` + `SameSite=Strict`
- BCrypt para hash de senha

**Frontend**
- React + TypeScript
- Vite
- React Router

## Decisões técnicas relevantes

Algumas decisões de arquitetura que valem a pena destacar (mais detalhes e o raciocínio completo por trás de cada uma estão documentados no repositório, em `CLAUDE.md`):

- **DTOs em toda a API** — os models do Entity Framework nunca são expostos diretamente, nem para entrada nem para saída. Evita over-posting e dá controle explícito sobre o que a API aceita/expõe.
- **Mudança de status é um endpoint dedicado** (`PATCH /api/candidaturas/{id}/status`), separado da edição genérica (`PUT`). Mudar o status tem um efeito colateral — gerar uma entrada no histórico — que não faz sentido misturar com a edição de campos simples.
- **O status anterior do histórico nunca vem do cliente.** O backend sempre lê o status atual do banco antes de trocar, para garantir que o histórico reflita a verdade, não o que o cliente informou.
- **Backend serve o build do frontend em produção.** Em vez de hospedar front e back em domínios separados (o que exigiria enfraquecer o cookie para `SameSite=None`, sujeito a bloqueio de cookies de terceiros em Safari/Firefox), o backend serve o SPA sob a mesma origem. O cookie de sessão continua com a configuração mais estrita (`SameSite=Strict`) tanto em desenvolvimento quanto em produção.
- **Banco de dados migrado de SQL Server para PostgreSQL** durante o desenvolvimento, especificamente para viabilizar opções de hospedagem gratuita real no deploy.

## Como rodar localmente

### Pré-requisitos

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 20 ou superior
- [PostgreSQL](https://www.postgresql.org/download/) rodando localmente
- Ferramenta `dotnet-ef` (`dotnet tool install --global dotnet-ef`), se ainda não tiver

### 1. Clonar o repositório

```bash
git clone https://github.com/dennismacedo88/jobtrail.git
cd jobtrail
```

### 2. Criar o banco de dados

Crie um banco vazio no PostgreSQL (o nome pode ser qualquer um, aqui usamos `JobTrailDb`).

### 3. Configurar os segredos do backend

A connection string e as chaves do JWT nunca ficam no código-fonte — são configuradas via User Secrets:

```bash
cd backend/JobTrail.Api

dotnet user-secrets set "ConnectionStrings:JobTrailDb" "Host=localhost;Port=5432;Database=JobTrailDb;Username=SEU_USUARIO;Password=SUA_SENHA"
dotnet user-secrets set "Jwt:Key" "uma-chave-secreta-bem-longa-e-aleatoria"
dotnet user-secrets set "Jwt:Issuer" "JobTrail.Api"
dotnet user-secrets set "Jwt:Audience" "JobTrail.Frontend"
```

### 4. Aplicar as migrations

```bash
dotnet ef database update
```

### 5. Rodar o backend

```bash
dotnet run --launch-profile http
```

A API sobe em `http://localhost:5274`.

### 6. Rodar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`, com um proxy de desenvolvimento (`/api` → `http://localhost:5274`) já configurado no `vite.config.ts`.

> **Alternativa "modo produção" local:** rodando `npm run build` dentro de `frontend/`, o build do React é gerado direto em `backend/JobTrail.Api/wwwroot`. A partir daí, basta rodar o backend (`dotnet run`) — ele serve a aplicação inteira (SPA + API) numa porta só, sem precisar do servidor do Vite.

## Roadmap

O projeto foi construído em fases — backend, autenticação, frontend e, agora, polimento para deploy. O estado detalhado e atualizado de cada etapa está em [ROADMAP.md](ROADMAP.md).

## Autor

Desenvolvido por **[Seu Nome]**, durante a busca pela minha primeira vaga como desenvolvedor.

- LinkedIn: [Link do LinkedIn]
- GitHub: [Link do GitHub]
