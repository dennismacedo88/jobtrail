using JobTrail.Api.Models;

namespace JobTrail.Api.Services
{
    public interface ITokenService
    {
        // Gera o token JWT para um usuário autenticado
        string GerarToken(Usuario usuario);
    }
}
