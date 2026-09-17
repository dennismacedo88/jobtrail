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
    public class EmpresasController : ControllerBase
    {
        private readonly JobTrailDbContext _context;

        public EmpresasController(JobTrailDbContext context)
        {
            _context = context;
        }

        // GET: api/empresas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpresaResponseDto>>> GetEmpresas()
        {
            var usuarioId = GetUsuarioId();

            var empresas = await _context.Empresas
                .Where(e => e.UsuarioId == usuarioId)
                .OrderBy(e => e.Nome)
                .Select(e => new EmpresaResponseDto
                {
                    Id = e.Id,
                    Nome = e.Nome,
                    Site = e.Site,
                    Notas = e.Notas,
                    CriadoEm = e.CriadoEm,
                    TotalCandidaturas = e.Candidaturas.Count
                })
                .ToListAsync();

            return Ok(empresas);
        }

        // GET: api/empresas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpresaResponseDto>> GetEmpresa(int id)
        {
            var usuarioId = GetUsuarioId();

            var empresa = await _context.Empresas
                .Where(e => e.Id == id && e.UsuarioId == usuarioId)
                .Select(e => new EmpresaResponseDto
                {
                    Id = e.Id,
                    Nome = e.Nome,
                    Site = e.Site,
                    Notas = e.Notas,
                    CriadoEm = e.CriadoEm,
                    TotalCandidaturas = e.Candidaturas.Count
                })
                .FirstOrDefaultAsync();

            if (empresa == null)
            {
                return NotFound(new { message = "Empresa não encontrada." });
            }

            return Ok(empresa);
        }

        // POST: api/empresas
        [HttpPost]
        public async Task<ActionResult<EmpresaResponseDto>> CreateEmpresa(EmpresaRequestDto dto)
        {
            var empresa = new Empresa
            {
                Nome = dto.Nome.Trim(),
                Site = dto.Site?.Trim(),
                Notas = dto.Notas?.Trim(),
                CriadoEm = DateTime.UtcNow,
                UsuarioId = GetUsuarioId()
            };

            _context.Empresas.Add(empresa);
            await _context.SaveChangesAsync();

            var responseDto = new EmpresaResponseDto
            {
                Id = empresa.Id,
                Nome = empresa.Nome,
                Site = empresa.Site,
                Notas = empresa.Notas,
                CriadoEm = empresa.CriadoEm,
                TotalCandidaturas = 0
            };

            return CreatedAtAction(nameof(GetEmpresa), new { id = empresa.Id }, responseDto);
        }

        // PUT: api/empresas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmpresa(int id, EmpresaRequestDto dto)
        {
            var usuarioId = GetUsuarioId();
            var empresa = await _context.Empresas
                .FirstOrDefaultAsync(e => e.Id == id && e.UsuarioId == usuarioId);

            if (empresa == null)
            {
                return NotFound(new { message = "Empresa não encontrada." });
            }

            empresa.Nome = dto.Nome.Trim();
            empresa.Site = dto.Site?.Trim();
            empresa.Notas = dto.Notas?.Trim();

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/empresas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpresa(int id)
        {
            var usuarioId = GetUsuarioId();
            var empresa = await _context.Empresas
                .FirstOrDefaultAsync(e => e.Id == id && e.UsuarioId == usuarioId);

            if (empresa == null)
            {
                return NotFound(new { message = "Empresa não encontrada." });
            }

            _context.Empresas.Remove(empresa);
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
    }
}