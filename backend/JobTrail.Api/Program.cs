using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using JobTrail.Api.Data;
using JobTrail.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Adiciona os controllers (endpoints da API)
// Configura o JSON para serializar enums como string (ex: "Entrevista"),
// em vez de número (ex: 3) — mais legível para o frontend e para debug.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Documentação da API (OpenAPI nativo do .NET, apenas em desenvolvimento)
builder.Services.AddOpenApi();

// Conexão com o banco de dados via Entity Framework Core
// A connection string vem do User Secrets (nunca do código-fonte)
var connectionString = builder.Configuration.GetConnectionString("JobTrailDb");
builder.Services.AddDbContext<JobTrailDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS estrito: por enquanto, apenas o frontend React local pode chamar essa API
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Service que gera o JWT no login (registrado como Scoped: não guarda estado
// entre requisições e depende de IConfiguration, também Scoped por padrão)
builder.Services.AddScoped<ITokenService, TokenService>();

// Autenticação JWT: o token não vem do header Authorization (padrão da lib),
// e sim de um cookie HttpOnly — por isso o evento OnMessageReceived abaixo
// intercepta a requisição e lê o token manualmente do cookie.
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Chave JWT (Jwt:Key) não configurada.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("jobtrail_token", out var token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Serve o build do React (gerado em wwwroot pelo `npm run build` do frontend,
// ver vite.config.ts) sob o mesmo domínio da API. Essa foi a decisão tomada
// para o cookie de sessão em produção: front e back em "mesma origem" evita
// ter que trocar SameSite=Strict por SameSite=None (que fica sujeito a
// bloqueio de cookie de terceiros em Safari/Firefox). Por isso a policy de
// CORS abaixo hoje só importa em desenvolvimento, via proxy do Vite — em
// produção não há requisição cross-origin nenhuma para o CORS regular.
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("FrontendPolicy");

// Authentication antes de Authorization: precisa identificar o usuário
// (ler e validar o JWT) antes de decidir se ele tem permissão de acesso.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback de SPA: qualquer rota que não bata em um Controller nem em um
// arquivo estático cai no index.html, para o React Router assumir o roteamento
// client-side (ex: dar F5 em /candidaturas/5). O regex exclui "api/..." do
// fallback — sem isso, uma rota de API inexistente devolveria o index.html
// com 200 em vez de um 404 de verdade.
app.MapFallbackToFile("{*path:regex(^(?!api).*$)}", "index.html");

app.Run();