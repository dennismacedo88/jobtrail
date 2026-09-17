import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ATENÇÃO — configuração específica de DESENVOLVIMENTO, não usada em produção.
      //
      // A API roda em HTTPS (https://localhost:7220) e o cookie de sessão usa
      // Secure + SameSite=Strict. Se o front chamasse a API diretamente, o
      // navegador consideraria http://localhost:5173 e https://localhost:7220
      // "sites" diferentes (scheme diferente = "schemeful same-site"), e o
      // cookie HttpOnly nunca seria enviado de volta nas chamadas seguintes ao
      // login — a sessão pareceria "não persistir", sem erro claro.
      //
      // Com o proxy, o navegador só enxerga requisições para
      // http://localhost:5173/api/..., ou seja, mesma origem da própria página.
      // O redirecionamento para o backend acontece no servidor do Vite, fora
      // do navegador, então o cookie chega e sai sem nenhuma restrição de
      // CORS/SameSite pela frente.
      //
      // TODO (Fase 4 — deploy): em produção não haverá "servidor do Vite".
      // Vamos precisar decidir entre (a) servir front e back sob o mesmo
      // domínio via proxy reverso (Nginx, Azure, etc.), replicando esse mesmo
      // efeito, ou (b) hospedar em domínios diferentes e trocar para
      // SameSite=None + CORS explícito por origem — decisão a tomar na Fase 4,
      // não antes.
      '/api': {
        target: 'https://localhost:7220',
        changeOrigin: true,
        secure: false, // aceita o certificado de desenvolvimento autoassinado do ASP.NET Core
      },
    },
  },
})
