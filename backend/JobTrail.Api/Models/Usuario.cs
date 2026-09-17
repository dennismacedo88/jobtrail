using System.ComponentModel.DataAnnotations;

namespace JobTrail.Api.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        // Nunca armazenar a senha em texto puro — sempre o hash gerado pelo BCrypt.
        [Required]
        public string SenhaHash { get; set; } = string.Empty;

        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        // Um usuário pode ter várias empresas cadastradas na sua busca de emprego
        public ICollection<Empresa> Empresas { get; set; } = new List<Empresa>();
    }
}
