using Microsoft.EntityFrameworkCore;
using JobTrail.Api.Models;

namespace JobTrail.Api.Data
{
    public class JobTrailDbContext : DbContext
    {
        public JobTrailDbContext(DbContextOptions<JobTrailDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Empresa> Empresas { get; set; }
        public DbSet<Candidatura> Candidaturas { get; set; }
        public DbSet<HistoricoStatus> HistoricosStatus { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuario>(entity =>
            {
                // Índice único: garante, também no banco, que não existam dois
                // usuários com o mesmo e-mail (não basta validar só na aplicação).
                entity.HasIndex(u => u.Email).IsUnique();
            });

            modelBuilder.Entity<Empresa>(entity =>
            {
                entity.HasIndex(e => e.UsuarioId);

                entity.HasOne(e => e.Usuario)
                      .WithMany(u => u.Empresas)
                      .HasForeignKey(e => e.UsuarioId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Candidatura>(entity =>
            {
                entity.HasIndex(c => c.EmpresaId);
                entity.HasIndex(c => c.Status);

                entity.Property(c => c.SalarioPretendido).HasPrecision(10, 2);
                entity.Property(c => c.SalarioOferecido).HasPrecision(10, 2);

                entity.HasOne(c => c.Empresa)
                      .WithMany(e => e.Candidaturas)
                      .HasForeignKey(c => c.EmpresaId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<HistoricoStatus>(entity =>
            {
                entity.HasIndex(h => h.CandidaturaId);

                entity.HasOne(h => h.Candidatura)
                      .WithMany(c => c.Historico)
                      .HasForeignKey(h => h.CandidaturaId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}