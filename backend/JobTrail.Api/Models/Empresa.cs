using System.ComponentModel.DataAnnotations;

namespace JobTrail.Api.Models
{
    public class Empresa
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(300)]
        public string? Site { get; set; }

        [MaxLength(1000)]
        public string? Notas { get; set; }

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        // Relacionamento: cada empresa pertence ao usuário que a cadastrou
        public int UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        // Uma empresa pode ter várias candidaturas associadas
        public ICollection<Candidatura> Candidaturas { get; set; } = new List<Candidatura>();
    }
}