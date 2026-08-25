namespace JobTrail.Api.Models
{
    public class HistoricoStatus
    {
        public int Id { get; set; }

        public StatusCandidatura StatusAnterior { get; set; }

        public StatusCandidatura StatusNovo { get; set; }

        public DateTime DataMudanca { get; set; } = DateTime.UtcNow;

        // Relacionamento: cada entrada de histórico pertence a uma candidatura
        public int CandidaturaId { get; set; }
        public Candidatura? Candidatura { get; set; }
    }
}