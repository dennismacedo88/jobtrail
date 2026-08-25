using Microsoft.EntityFrameworkCore;
using JobTrail.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Adiciona os controllers (endpoints da API)
builder.Services.AddControllers();

// Documentação da API (OpenAPI nativo do .NET, apenas em desenvolvimento)
builder.Services.AddOpenApi();

// Conexão com o banco de dados via Entity Framework Core
// A connection string vem do User Secrets (nunca do código-fonte)
var connectionString = builder.Configuration.GetConnectionString("JobTrailDb");
builder.Services.AddDbContext<JobTrailDbContext>(options =>
    options.UseSqlServer(connectionString));

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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("FrontendPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();