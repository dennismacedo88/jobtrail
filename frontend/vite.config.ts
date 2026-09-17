import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
      // TODO (Fase 4 — deploy): em produção não haverá "servidor do Vite".
      // Vamos precisar decidir entre (a) servir front e back sob o mesmo
      // domínio via proxy reverso (Nginx, Azure, etc.), replicando esse mesmo
      // efeito, ou (b) hospedar em domínios diferentes e trocar para
      // SameSite=None + CORS explícito por origem — decisão a tomar na Fase 4,
      // não antes.
      '/api': {
        target: 'http://localhost:5274',
        changeOrigin: true,
      },
    },
  },
})
