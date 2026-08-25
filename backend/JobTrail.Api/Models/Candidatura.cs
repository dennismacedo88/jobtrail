using System.ComponentModel.DataAnnotations;

namespace JobTrail.Api.Models
{
    public enum StatusCandidatura
    {
        Aplicado = 0,
        Triagem = 1,
        TesteTecnico = 2,
        Entrevista = 3,
        Oferta = 4,
        Rejeitado = 5,
        Desistiu = 6
    }

    public class Candidatura
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Cargo { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? LinkVaga { get; set; }

        public decimal? SalarioPretendido { get; set; }

        public decimal? SalarioOferecido { get; set; }

        [MaxLength(1000)]
        public string? Notas { get; set; }

        public StatusCandidatura Status { get; set; } = StatusCandidatura.Aplicado;

        public DateTime DataAplicacao { get; set; } = DateTime.UtcNow;

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        // Relacionamento: cada candidatura pertence a uma empresa
        public int EmpresaId { get; set; }
        public Empresa? Empresa { get; set; }

        // Relacionamento: uma candidatura tem várias entradas de histórico
        public ICollection<HistoricoStatus> Historico { get; set; } = new List<HistoricoStatus>();
    }
}