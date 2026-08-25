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

        public DbSet<Empresa> Empresas { get; set; }
        public DbSet<Candidatura> Candidaturas { get; set; }
        public DbSet<HistoricoStatus> HistoricosStatus { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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