# NEXO ERP PRO 9.8 LAB — Auditoria e Varredura Crítica

## Escopo desta rodada
Esta auditoria cobre a camada pública UI/UX do 9.8 LAB e os requisitos de integração futura com o Electron privado. Ela **não afirma** que o `app.asar` comercial 9.7 já foi alterado.

## Achados corrigidos nesta branch

### Alta prioridade
1. **CSP ausente na camada pública** — adicionada política restritiva sem `unsafe-inline`, sem rede e sem objetos/plugins.
2. **Busca usava `innerHTML`** — substituída por construção segura de DOM com `textContent`/`createElement`.
3. **Menu compacto ilegível** — o breakpoint antigo transformava todos os módulos no mesmo marcador `•`; substituído por identificadores curtos exclusivos e rótulos acessíveis.
4. **Command Palette sem controle de foco** — adicionados diálogo modal, restauração de foco, `Escape`, trava de Tab e navegação por setas.

### Média prioridade
5. `aria-current` agora acompanha o módulo ativo.
6. Busca `Ctrl+K` passou a informar `aria-expanded`.
7. Busca normaliza acentos para consultas como `relatorios`, `integrações` e `licenca`.
8. Resultados de busca não executam HTML gerado.
9. Botões declaram explicitamente `type="button"`.
10. Links e botões receberam estado `:focus-visible`.
11. Gráfico demonstrativo recebeu descrição acessível.
12. Ações “Ver todos” e “Abrir NEXO IA” agora navegam para os módulos correspondentes.

### UX / desempenho
13. Adicionado `prefers-reduced-motion`.
14. Adicionado fallback quando `backdrop-filter` não está disponível.
15. Melhorado layout em 1180 px, 850 px e 560 px.
16. Tabelas/cards financeiros foram ajustados para telas estreitas.
17. Adicionada rota por hash para manter módulo atual sem depender de servidor web.
18. Removidos estilos inline das barras para permitir CSP restritiva.

## Varredura automatizada
Arquivo: `tests/ui_static_check.mjs`

A suíte verifica, entre outros pontos:
- CSP básica;
- ausência de script/style/handlers inline;
- ausência de `innerHTML`, `eval`, `new Function` e `document.write`;
- declaração de `type` em botões;
- semântica do diálogo de busca;
- event delegation;
- foco visível e reduced motion;
- ausência do antigo marcador genérico do menu compacto;
- ausência de URLs remotas no protótipo;
- presença dos 16 módulos previstos.

Workflow: `.github/workflows/ui-static-check.yml`.

## Gates obrigatórios antes de portar para o Electron comercial

### P0 — não liberar sem conferir
- `contextIsolation=true`, `nodeIntegration=false`, `sandbox=true` onde compatível e `webSecurity=true`.
- Validar `senderFrame`/origem em **todo IPC privilegiado**.
- Preload deve expor funções específicas via `contextBridge`; nunca repassar `ipcRenderer.send/invoke` genérico ao renderer.
- Bloquear navegação não permitida, `webview`, novas janelas e permissões por padrão.
- `shell.openExternal` somente para URLs parseadas e em allowlist HTTPS.
- Manter chave privada, token administrativo e credenciais de integrações fora do cliente.
- Venda/cancelamento/estoque/caixa/financeiro precisam continuar transacionais e auditáveis.

### P0 — banco e backup
- SQLite/WAL permanece base operacional.
- Não copiar ingenuamente um arquivo SQLite ativo enquanto há transação.
- Preferir SQLite Online Backup API ou `VACUUM INTO` conforme suporte da biblioteca usada.
- Após backup: validar abertura + `PRAGMA quick_check`/checagem equivalente, checksum e política de retenção.
- Restauração deve ocorrer somente em fluxo controlado, nunca sobre banco aberto pela aplicação.

### P1 — pipeline Windows oficial
Avaliar/aplicar no rebuild oficial do Electron, antes de Authenticode:
- `FuseV1Options.RunAsNode = false` se o aplicativo não depender de `ELECTRON_RUN_AS_NODE`/`child_process.fork`.
- `FuseV1Options.EnableNodeOptionsEnvironmentVariable = false` em produção se não houver dependência legítima.
- `FuseV1Options.EnableNodeCliInspectArguments = false` em produção.
- `FuseV1Options.EnableEmbeddedAsarIntegrityValidation = true`.
- `FuseV1Options.OnlyLoadAppFromAsar = true`.
- Avaliar `EnableCookieEncryption` somente com plano de migração, pois a mudança é sensível ao estado do perfil Chromium.

### P1 — protocolo e renderer
- Avaliar migração de `file://` para protocolo customizado registrado como seguro/standard no Electron.
- CSP do aplicativo real deve ser ajustada ao protocolo e às integrações efetivamente necessárias; não copiar cegamente `connect-src 'none'` da UI pública.
- Nenhuma integração externa deve liberar `http://`; usar HTTPS e allowlist por provedor.

## Dívidas técnicas que continuam abertas no ERP privado
- Reduzir IPC síncrono e operações de disco no thread principal.
- Separar progressivamente o `app.js` monolítico por domínios.
- Tornar SQLite relacional cada vez mais a fonte transacional primária, reduzindo dependência do snapshot legado.
- Homologar Windows 10/11, DPI, impressora térmica, leitor, balança, gaveta e cenários de energia/rede.
- Aplicar Authenticode quando existir certificado comercial NEXO.
- Integrações fiscais/TEF/PIX/marketplaces continuam dependentes de credenciais, contratos e homologação reais.

## Regra de promoção
`9.7 FINAL congelada -> 9.8 LAB -> regressão completa -> 9.8 RC -> teste físico Windows -> 9.8 FINAL`.
