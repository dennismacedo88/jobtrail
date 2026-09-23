# Build de produção: gera o SPA do React e publica a API .NET que o serve
# (decisão da Fase 4 — ver Program.cs e vite.config.ts). Usado pelo Render,
# que não tem runtime nativo para .NET.

# ---- 1) build do frontend (gera o SPA dentro de backend/JobTrail.Api/wwwroot) ----
FROM node:20-alpine AS frontend-build
WORKDIR /src
COPY frontend/package*.json frontend/
RUN npm --prefix frontend ci
COPY frontend/ frontend/
# vite.config.ts usa build.outDir = ../backend/JobTrail.Api/wwwroot (relativo a
# frontend/) — por isso o csproj precisa existir aqui, só pra criar a pasta.
COPY backend/JobTrail.Api/JobTrail.Api.csproj backend/JobTrail.Api/JobTrail.Api.csproj
RUN npm --prefix frontend run build

# ---- 2) build e publish do backend ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY backend/JobTrail.Api/JobTrail.Api.csproj backend/JobTrail.Api/
RUN dotnet restore backend/JobTrail.Api/JobTrail.Api.csproj
COPY backend/JobTrail.Api/ backend/JobTrail.Api/
COPY --from=frontend-build /src/backend/JobTrail.Api/wwwroot backend/JobTrail.Api/wwwroot
RUN dotnet publish backend/JobTrail.Api/JobTrail.Api.csproj -c Release -o /app/publish --no-restore

# ---- 3) imagem final, só com o runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=backend-build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
# Render injeta a variável PORT (padrão 10000) e o container precisa escutar
# nela — por isso lida em tempo de execução via shell, não com ENV fixo.
ENTRYPOINT ["/bin/sh", "-c", "exec dotnet JobTrail.Api.dll --urls http://0.0.0.0:${PORT:-8080}"]
