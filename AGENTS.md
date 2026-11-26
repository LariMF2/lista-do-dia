# Regras Técnicas e Convenções — Lista do Dia

## 1. Abordagem de Desenvolvimento
- **Desenvolvimento Incremental por Fases:** Implementar uma fase de cada vez conforme definido no `plan.md`. Validar cada etapa antes de avançar para a seguinte.
- **Fidelidade ao Plano:** Não adicionar funcionalidades fora do `README.md`.

## 2. Stack Tecnológica
- **Estrutura:** HTML5 semântico (`index.html`).
- **Estilos:** Bootstrap 5 (via CDN) + CSS personalizado (`css/styles.css`) com variáveis CSS para a paleta personalizada (Verde Sálvia `#6A968E` e tons complementares/análogos).
- **Lógica:** JavaScript puro / Vanilla JS (`js/app.js`).
- **Ícones e Tipografia:** Google Fonts (`Inter`) e `Material Symbols Outlined`.

## 3. Convenções de Código e Idioma
- **Interface do Utilizador:** Todos os textos visíveis, mensagens de erro e botões em **Português de Portugal** (PT-PT).
- **Código:** Nomes de variáveis, funções, IDs e classes CSS em inglês, claros e descritivos.
- **Organização:** Funções pequenas e separadas por responsabilidade (Autenticação, Gestão de Tarefas, Projetos, Renderização e Persistência).

## 4. Restrições Técnicas e Segurança
- **100% Local:** Sem backend remoto, APIs externas ou serviços cloud.
- **Privacidade:** Palavra-passe e respostas de segurança encriptadas com hash `SHA-256` antes de serem guardadas no `localStorage`.
- **Validação:** Validar todos os formulários antes de guardar dados.