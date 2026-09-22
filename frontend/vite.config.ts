import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Decisão da Fase 4 (cookie/CORS em produção): o backend serve o build do
    // React em vez de hospedar front e back em domínios separados — assim o
    // cookie de sessão continua em SameSite=Strict, sem precisar relaxar para
    // SameSite=None (que fica sujeito a bloqueio de cookie de terceiros em
    // Safari/Firefox). `npm run build` gera os arquivos direto na wwwroot do
    // backend, que o Program.cs serve via UseStaticFiles + MapFallbackToFile.
    outDir: '../backend/JobTrail.Api/wwwroot',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // ATENÇÃO — configuração específica de DESENVOLVIMENTO, não usada em produção.
      //
      // O cookie de sessão usa Secure + SameSite=Strict. Se o front chamasse a
      // API diretamente (cross-origin), o navegador poderia tratar as duas
      // origens como "sites" diferentes dependendo do scheme de cada uma
      // (scheme diferente = "schemeful same-site"), e o cookie nunca seria
      // enviado de volta nas chamadas seguintes ao login — a sessão pareceria
      // "não persistir", sem erro claro.
      //
      // Com o proxy, o navegador só enxerga requisições para
      // http://localhost:5173/api/..., ou seja, mesma origem da própria
      // página. O hop até o backend acontece no servidor do Vite, fora do
      // navegador — então o scheme real do backend (http ou https) é
      // irrelevante para o navegador, e o cookie chega/sai sem nenhuma
      // restrição de CORS/SameSite pela frente. Isso também é o motivo de
      // apontar para a porta HTTP (5274): tanto o launchSettings.json profile
      // "http" quanto o "https" expõem essa porta, então o proxy funciona
      // não importa qual dos dois você rode.
      //
      // Em produção não há "servidor do Vite" — quem serve o front é o
      // próprio backend (ver `build.outDir` acima e Program.cs), então essa
      // seção de proxy só existe para o fluxo de `npm run dev`.
      '/api': {
        target: 'http://localhost:5274',
        changeOrigin: true,
      },
    },
  },
})
