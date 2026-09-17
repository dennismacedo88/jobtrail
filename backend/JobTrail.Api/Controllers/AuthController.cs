using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobTrail.Api.Data;
using JobTrail.Api.Models;
using JobTrail.Api.DTOs;
using JobTrail.Api.Services;

namespace JobTrail.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly JobTrailDbContext _context;
        private readonly ITokenService _tokenService;

        // Nome do cookie HttpOnly que carrega o token JWT
        private const string CookieToken = "jobtrail_token";

        public AuthController(JobTrailDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<UsuarioResponseDto>> Register(RegisterDto dto)
        {
            var emailNormalizado = dto.Email.Trim().ToLowerInvariant();

            var emailJaExiste = await _context.Usuarios
                .AnyAsync(u => u.Email == emailNormalizado);

            if (emailJaExiste)
            {
                return BadRequest(new { message = "Este e-mail já está cadastrado." });
            }

            var usuario = new Usuario
            {
                Nome = dto.Nome.Trim(),
                Email = emailNormalizado,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
                CriadoEm = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var responseDto = new UsuarioResponseDto
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                CriadoEm = usuario.CriadoEm
            };

            return CreatedAtAction(nameof(Register), responseDto);
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<UsuarioResponseDto>> Login(LoginDto dto)
        {
            var emailNormalizado = dto.Email.Trim().ToLowerInvariant();

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == emailNormalizado);

            // Mensagem de erro sempre genérica: nunca revelar se o e-mail existe
            // ou se foi a senha que errou (evita enumeração de usuários).
            if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
            {
                return Unauthorized(new { message = "E-mail ou senha inválidos." });
            }

            var token = _tokenService.GerarToken(usuario);
            DefinirCookieToken(token);

            var responseDto = new UsuarioResponseDto
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                CriadoEm = usuario.CriadoEm
            };

            return Ok(responseDto);
        }

        // POST: api/auth/logout
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete(CookieToken);
            return NoContent();
        }

        // Centraliza a configuração do cookie do token (DRY, mesmo padrão de
        // MapToResponseDto nos outros Controllers): HttpOnly (JS não acessa),
        // Secure (só HTTPS) e SameSite=Strict (não é enviado em requisições
        // de outros sites, mitigando CSRF).
        private void DefinirCookieToken(string token)
        {
            Response.Cookies.Append(CookieToken, token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(8)
            });
        }
    }
}
