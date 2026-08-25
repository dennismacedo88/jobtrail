using System.ComponentModel.DataAnnotations;

namespace JobTrail.Api.DTOs
{
    // DTO usado para CRIAR ou ATUALIZAR uma empresa
    public class EmpresaRequestDto
    {
        [Required(ErrorMessage = "O nome da empresa é obrigatório.")]
        [MaxLength(150)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(300)]
        [Url(ErrorMessage = "O site informado não é uma URL válida.")]
        public string? Site { get; set; }

        [MaxLength(1000)]
        public string? Notas { get; set; }
    }

    // DTO usado para RETORNAR dados de uma empresa
    public class EmpresaResponseDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Site { get; set; }
        public string? Notas { get; set; }
        public DateTime CriadoEm { get; set; }
        public int TotalCandidaturas { get; set; }
    }
}
