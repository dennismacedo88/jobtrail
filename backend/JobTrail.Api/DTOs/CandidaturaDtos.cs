using System.ComponentModel.DataAnnotations;
using JobTrail.Api.Models;

namespace JobTrail.Api.DTOs
{
    // DTO usado para CRIAR uma candidatura
    public class CandidaturaRequestDto
    {
        [Required(ErrorMessage = "O cargo é obrigatório.")]
        [MaxLength(150)]
        public string Cargo { get; set; } = string.Empty;

        [Required(ErrorMessage = "A empresa é obrigatória.")]
        public int EmpresaId { get; set; }

        [MaxLength(500)]
        [Url(ErrorMessage = "O link da vaga não é uma URL válida.")]
        public string? LinkVaga { get; set; }

        [Range(0, 9999999.99, ErrorMessage = "Salário pretendido inválido.")]
        public decimal? SalarioPretendido { get; set; }

        [Range(0, 9999999.99, ErrorMessage = "Salário oferecido inválido.")]
        public decimal? SalarioOferecido { get; set; }

        [MaxLength(1000)]
        public string? Notas { get; set; }

        public DateTime? DataAplicacao { get; set; }
    }

    // DTO usado para ATUALIZAR os dados gerais de uma candidatura
    // (não inclui Status — isso é feito por um endpoint dedicado)
    public class CandidaturaUpdateDto
    {
        [Required(ErrorMessage = "O cargo é obrigatório.")]
        [MaxLength(150)]
        public string Cargo { get; set; } = string.Empty;

        [MaxLength(500)]
        [Url(ErrorMessage = "O link da vaga não é uma URL válida.")]
        public string? LinkVaga { get; set; }

        [Range(0, 9999999.99, ErrorMessage = "Salário pretendido inválido.")]
        public decimal? SalarioPretendido { get; set; }

        [Range(0, 9999999.99, ErrorMessage = "Salário oferecido inválido.")]
        public decimal? SalarioOferecido { get; set; }

        [MaxLength(1000)]
        public string? Notas { get; set; }
    }

    // DTO usado exclusivamente para MUDAR O STATUS de uma candidatura.
    // StatusAnterior NUNCA vem do cliente — é lido do banco no Controller,
    // garantindo que o histórico reflita a verdade, não o que o cliente alega.
    public class MudarStatusDto
    {
        [Required(ErrorMessage = "O novo status é obrigatório.")]
        public StatusCandidatura NovoStatus { get; set; }
    }

    // DTO de retorno de uma candidatura.
    // Empresa é achatada (EmpresaId + NomeEmpresa) em vez de objeto aninhado,
    // evitando over-fetching e duplicação de lógica de serialização.
    public class CandidaturaResponseDto
    {
        public int Id { get; set; }
        public string Cargo { get; set; } = string.Empty;
        public int EmpresaId { get; set; }
        public string NomeEmpresa { get; set; } = string.Empty;
        public string? LinkVaga { get; set; }
        public decimal? SalarioPretendido { get; set; }
        public decimal? SalarioOferecido { get; set; }
        public string? Notas { get; set; }
        public StatusCandidatura Status { get; set; }
        public DateTime DataAplicacao { get; set; }
        public DateTime CriadoEm { get; set; }
    }

    // DTO de retorno de uma entrada do histórico de status
    public class HistoricoStatusResponseDto
    {
        public int Id { get; set; }
        public StatusCandidatura StatusAnterior { get; set; }
        public StatusCandidatura StatusNovo { get; set; }
        public DateTime DataMudanca { get; set; }
    }
}