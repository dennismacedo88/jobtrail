using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobTrail.Api.Data;
using JobTrail.Api.Models;
using JobTrail.Api.DTOs;

namespace JobTrail.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CandidaturasController : ControllerBase
    {
        private readonly JobTrailDbContext _context;

        public CandidaturasController(JobTrailDbContext context)
        {
            _context = context;
        }

        // GET: api/candidaturas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CandidaturaResponseDto>>> GetCandidaturas()
        {
            var usuarioId = GetUsuarioId();

            var candidaturas = await _context.Candidaturas
                .Include(c => c.Empresa)
                .Where(c => c.Empresa!.UsuarioId == usuarioId)
                .OrderByDescending(c => c.DataAplicacao)
                .Select(c => MapToResponseDto(c))
                .ToListAsync();

            return Ok(candidaturas);
        }

        // GET: api/candidaturas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CandidaturaResponseDto>> GetCandidatura(int id)
        {
            var usuarioId = GetUsuarioId();

            var candidatura = await _context.Candidaturas
                .Include(c => c.Empresa)
                .Where(c => c.Id == id && c.Empresa!.UsuarioId == usuarioId)
                .Select(c => MapToResponseDto(c))
                .FirstOrDefaultAsync();

            if (candidatura == null)
            {
                return NotFound(new { message = "Candidatura não encontrada." });
            }

            return Ok(candidatura);
        }

        // GET: api/candidaturas/5/historico
        [HttpGet("{id}/historico")]
        public async Task<ActionResult<IEnumerable<HistoricoStatusResponseDto>>> GetHistorico(int id)
        {
            var usuarioId = GetUsuarioId();
            var candidaturaExiste = await _context.Candidaturas
                .AnyAsync(c => c.Id == id && c.Empresa!.UsuarioId == usuarioId);

            if (!candidaturaExiste)
            {
                return NotFound(new { message = "Candidatura não encontrada." });
            }

            var historico = await _context.HistoricosStatus
                .Where(h => h.CandidaturaId == id)
                .OrderByDescending(h => h.DataMudanca)
                .Select(h => new HistoricoStatusResponseDto
                {
                    Id = h.Id,
                    StatusAnterior = h.StatusAnterior,
                    StatusNovo = h.StatusNovo,
                    DataMudanca = h.DataMudanca
                })
                .ToListAsync();

            return Ok(historico);
        }

        // POST: api/candidaturas
        [HttpPost]
        public async Task<ActionResult<CandidaturaResponseDto>> CreateCandidatura(CandidaturaRequestDto dto)
        {
            var usuarioId = GetUsuarioId();

            // Garante que a empresa informada existe E pertence ao usuário logado —
            // sem essa segunda checagem, seria possível criar uma candidatura
            // vinculada à empresa de outra pessoa apenas informando o Id dela.
            var empresaPertenceAoUsuario = await _context.Empresas
                .AnyAsync(e => e.Id == dto.EmpresaId && e.UsuarioId == usuarioId);

            if (!empresaPertenceAoUsuario)
            {
                return BadRequest(new { message = "Empresa informada não existe." });
            }

            var candidatura = new Candidatura
            {
                Cargo = dto.Cargo.Trim(),
                EmpresaId = dto.EmpresaId,
                LinkVaga = dto.LinkVaga?.Trim(),
                SalarioPretendido = dto.SalarioPretendido,
                SalarioOferecido = dto.SalarioOferecido,
                Notas = dto.Notas?.Trim(),
                Status = StatusCandidatura.Aplicado,
                DataAplicacao = dto.DataAplicacao ?? DateTime.UtcNow,
                CriadoEm = DateTime.UtcNow
            };

            _context.Candidaturas.Add(candidatura);
            await _context.SaveChangesAsync();

            await _context.Entry(candidatura).Reference(c => c.Empresa).LoadAsync();

            var responseDto = MapToResponseDto(candidatura);

            return CreatedAtAction(nameof(GetCandidatura), new { id = candidatura.Id }, responseDto);
        }

        // PUT: api/candidaturas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCandidatura(int id, CandidaturaUpdateDto dto)
        {
            var usuarioId = GetUsuarioId();
            var candidatura = await _context.Candidaturas
                .Include(c => c.Empresa)
                .FirstOrDefaultAsync(c => c.Id == id && c.Empresa!.UsuarioId == usuarioId);

            if (candidatura == null)
            {
                return NotFound(new { message = "Candidatura não encontrada." });
            }

            candidatura.Cargo = dto.Cargo.Trim();
            candidatura.LinkVaga = dto.LinkVaga?.Trim();
            candidatura.SalarioPretendido = dto.SalarioPretendido;
            candidatura.SalarioOferecido = dto.SalarioOferecido;
            candidatura.Notas = dto.Notas?.Trim();

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/candidaturas/5/status
        // Endpoint dedicado para mudança de status, que também registra o histórico.
        [HttpPatch("{id}/status")]
        public async Task<ActionResult<CandidaturaResponseDto>> MudarStatus(int id, MudarStatusDto dto)
        {
            var usuarioId = GetUsuarioId();
            var candidatura = await _context.Candidaturas
                .Include(c => c.Empresa)
                .FirstOrDefaultAsync(c => c.Id == id && c.Empresa!.UsuarioId == usuarioId);

            if (candidatura == null)
            {
                return NotFound(new { message = "Candidatura não encontrada." });
            }

            var statusAnterior = candidatura.Status;

            var historico = new HistoricoStatus
            {
                CandidaturaId = candidatura.Id,
                StatusAnterior = statusAnterior,
                StatusNovo = dto.NovoStatus,
                DataMudanca = DateTime.UtcNow
            };

            candidatura.Status = dto.NovoStatus;

            _context.HistoricosStatus.Add(historico);
            await _context.SaveChangesAsync();

            var responseDto = MapToResponseDto(candidatura);

            return Ok(responseDto);
        }

        // DELETE: api/candidaturas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCandidatura(int id)
        {
            var usuarioId = GetUsuarioId();
            var candidatura = await _context.Candidaturas
                .Include(c => c.Empresa)
                .FirstOrDefaultAsync(c => c.Id == id && c.Empresa!.UsuarioId == usuarioId);

            if (candidatura == null)
            {
                return NotFound(new { message = "Candidatura não encontrada." });
            }

            _context.Candidaturas.Remove(candidatura);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Lê o Id do usuário autenticado a partir da claim gravada no JWT
        // (ver TokenService.GerarToken). Como o Controller é [Authorize],
        // a claim sempre existe quando este método é chamado.
        private int GetUsuarioId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            return int.Parse(claim);
        }

        // Método auxiliar privado: centraliza a conversão de Candidatura para DTO,
        // evitando duplicar essa lógica em cada endpoint (princípio DRY).
        private static CandidaturaResponseDto MapToResponseDto(Candidatura c)
        {
            return new CandidaturaResponseDto
            {
                Id = c.Id,
                Cargo = c.Cargo,
                EmpresaId = c.EmpresaId,
                NomeEmpresa = c.Empresa?.Nome ?? string.Empty,
                LinkVaga = c.LinkVaga,
                SalarioPretendido = c.SalarioPretendido,
                SalarioOferecido = c.SalarioOferecido,
                Notas = c.Notas,
                Status = c.Status,
                DataAplicacao = c.DataAplicacao,
                CriadoEm = c.CriadoEm
            };
        }
    }
}