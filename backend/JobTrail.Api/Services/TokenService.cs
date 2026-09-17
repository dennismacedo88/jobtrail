using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using JobTrail.Api.Models;

namespace JobTrail.Api.Services
{
    // Responsável exclusivamente por gerar o JWT do usuário autenticado.
    // Extraído como Service (em vez de ficar no Controller) porque geração
    // de token é uma responsabilidade própria, reutilizável e testável
    // isoladamente — Controllers finos, seguindo o padrão do projeto.
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GerarToken(Usuario usuario)
        {
            var chaveSecreta = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("Chave JWT (Jwt:Key) não configurada.");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim(ClaimTypes.Email, usuario.Email)
            };

            var credenciais = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chaveSecreta)),
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credenciais);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
