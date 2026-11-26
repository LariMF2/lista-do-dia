# Plano de Implementação por Fases — Lista do Dia

## Arquitetura de Ficheiros
- `index.html` — Estrutura principal da aplicação (ecrãs de autenticação e vistas da app).
- `css/styles.css` — Tema escuro personalizado, variáveis da paleta Verde Sálvia (`#6A968E`), cartões *glassmorphism* e ajustes sobre o Bootstrap 5.
- `js/app.js` — Estado da aplicação, criptografia local (`SHA-256`), `localStorage` e lógica das 4 vistas.
- `design/` — Ficheiros de referência visual exportados do Stitch.

## Fases de Desenvolvimento
- **Fase 1 — Estrutura Base, Tema Visual e Autenticação Local:**
  - Configurar `index.html`, `css/styles.css` (com a paleta Verde Sálvia `#6A968E` e tons complementares) e `js/app.js`.
  - Implementar Registo de Conta Única (com 2 perguntas de segurança), Login, Logout e Recuperação de Palavra-passe.
- **Fase 2 — Vista "Hoje" e CRUD de Tarefas:**
  - Implementar o cabeçalho, cartão de progresso diário (`%`), filtros (*Todas*, *Pendentes*, *Concluídas*), estado vazio com sugestões rápidas, criação, edição, conclusão e eliminação de tarefas com modal de confirmação.
- **Fase 3 — Vistas "Plano", "Projetos" e "Métricas":**
  - Ativar a navegação inferior entre os 4 separadores.
  - Implementar agrupamento por datas no *Plano*, gestão de categorias/pastas em *Projetos* e resumo estatístico em *Métricas*.
- **Fase 4 — Polimento Final e Responsividade:**
  - Rever validações, estados vazios em todas as vistas, adaptação mobile/desktop e testes finais.