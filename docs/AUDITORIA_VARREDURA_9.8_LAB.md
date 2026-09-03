# NEXO ERP PRO 9.8 LAB — Auditoria e Varredura Crítica

## Escopo desta rodada
Esta auditoria cobre a camada pública UI/UX do 9.8 LAB e os requisitos de integração futura com o Electron privado. Ela **não afirma** que o `app.asar` comercial 9.7 já foi alterado.

## Módulos operacionais implementados no LAB

### PDV / Nova Venda
- Busca por nome e SKU.
- Catálogo responsivo.
- Carrinho local com incremento/decremento de quantidade.
- Limite de quantidade pelo estoque demonstrativo, com aviso ao atingir o máximo.
- Dinheiro, PIX, débito, crédito e fiado como opções visuais.
- Suspensão e limpeza de venda em memória.
- Finalização deliberadamente bloqueada para persistência: o LAB valida a UX e o resumo, mas não grava venda real.

### Recebimentos 360
- Vendido, liquidado, a conciliar e a receber em indicadores separados.
- Movimentos com bruto, líquido, origem, estágio e data.
- Filtros de liquidados e pendentes com anúncio de quantidade.
- Agenda de liquidação para PIX, débito, crédito e marketplace.
- Regra preservada: venda não equivale a recebimento.

### Financeiro
- Contas a receber, contas a pagar, saldo projetado e margem operacional.
- Aging de recebíveis.
- Fluxo de caixa projetado.
- Próximos compromissos e prioridades.
- Ação de destaque dos compromissos substitui o antigo botão sem comportamento.
- Nenhuma baixa/lançamento é persistido na camada pública.

### Estoque
- Físico, reservado, disponível e em trânsito.
- Disponível calculado como `físico - reservado`.
- Busca e filtros de atenção/críticos com anúncio de quantidade.
- Sugestões demonstrativas de reposição.
- Regra preservada: item em trânsito não aumenta estoque físico antes do recebimento.

### Pedidos
- Fila operacional com canal, cliente, tempo, total, status e próxima ação.
- Filtros de ativos/todos/atenção.
- O filtro de atenção exclui pedidos já entregues.
- Evolução de status apenas em memória do LAB.

### Delivery
- Entregas por pedido, região, entregador, ETA e status.
- Indicadores de SLA.
- Faixas de desempenho visualizadas sem localização real.

### Produtos
- Catálogo com busca por nome/SKU/categoria.
- Custo, preço, margem e estoque.
- Limiar único `LOW_MARGIN=55` usado pelo indicador e pelo filtro de margem.
- Filtro de estoque baixo.

### Compras
- Ordens de compra com fornecedor, itens, previsão, total e status.
- Aprovação/recebimento simulados em memória.
- Recebimento do LAB declara explicitamente que não altera estoque real.
- Checklist de conferência antes da entrada transacional.

### Fornecedores
- Lead time, score, valor em aberto e última compra.
- Badges de score crítico/atenção/sucesso corrigidos.

### Caixa
- Fundo inicial, vendas em dinheiro, suprimentos, sangrias e caixa esperado.
- Cartões/marketplaces/recebíveis permanecem fora do caixa físico.
- Suprimento, sangria e fechamento são simulações locais.
- Sangria bloqueia valor inválido ou superior ao caixa esperado.

### Clientes / CRM
- Recência, frequência, valor histórico, segmento e crédito.
- Filtros de risco e saldo em aberto.
- Nenhum telefone/e-mail/dado pessoal real entra na camada pública.
- Badge VIP corrigido para a identidade roxa reservada a destaque especial.

## Achados corrigidos nesta branch

### Alta prioridade
1. **CSP ausente na camada pública** — adicionada política restritiva sem `unsafe-inline`, sem rede e sem objetos/plugins.
2. **Busca usava `innerHTML`** — substituída por construção segura de DOM com `textContent`/`createElement`.
3. **Menu compacto ilegível** — o breakpoint antigo transformava todos os módulos no mesmo marcador `•`; substituído por identificadores curtos exclusivos e rótulos acessíveis.
4. **Command Palette sem controle de foco** — adicionados diálogo modal, restauração de foco, `Escape`, trava de Tab e navegação por setas.
5. **Risco de tela em branco** — adicionado fallback seguro quando um módulo marcado/roteado não consegue ser montado.

### Correções de lógica e UX
6. `aria-current` acompanha o módulo ativo.
7. Busca `Ctrl+K` informa `aria-expanded` e normaliza acentos.
8. Resultados de busca não executam HTML gerado.
9. Botões HTML declaram `type="button"`.
10. Links e botões possuem `:focus-visible`.
11. Gráfico demonstrativo possui descrição acessível.
12. Ações do Dashboard navegam para seus módulos.
13. Rotas por hash mantêm o módulo atual sem servidor.
14. `prefers-reduced-motion` e fallback de `backdrop-filter` foram adicionados.
15. Layout foi revisado em 1180 px, 850 px e 560 px.
16. Badges `danger` e `purple` receberam estilos próprios.
17. Filtro de atenção de Pedidos não inclui concluídos.
18. Indicador/filtro de margem usam o mesmo limiar nomeado.
19. Trecho temporário `appendDummy` foi removido do DOM do catálogo.
20. Sangria valida valor não positivo e saldo esperado.

## Varredura automatizada
Arquivos: `tests/ui_static_check.mjs` e `.github/workflows/ui-static-check.yml`.

O pipeline executa:
- `node --check ui/app.js`;
- `node --check ui/phase2.js`;
- varredura CSP/UX/segurança;
- validação de `modules.css` e `phase2.css`;
- presença dos 16 módulos de navegação;
- presença das 11 telas operacionais já montadas;
- ausência de `innerHTML`, `insertAdjacentHTML`, `eval`, `new Function` e `document.write`;
- ausência de URLs remotas na UI pública;
- validação das regras demonstrativas de estoque, recebimentos, pedidos, margem, compras, caixa e CRM.

**Resultado da rodada:** 67/67 verificações PASS no GitHub Actions, além das duas verificações de sintaxe JavaScript.

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
- `RunAsNode = false` se o aplicativo não depender de `ELECTRON_RUN_AS_NODE`/`child_process.fork`.
- `EnableNodeOptionsEnvironmentVariable = false` em produção se não houver dependência legítima.
- `EnableNodeCliInspectArguments = false` em produção.
- `EnableEmbeddedAsarIntegrityValidation = true`.
- `OnlyLoadAppFromAsar = true`.
- Avaliar `EnableCookieEncryption` somente com plano de migração.

### P1 — protocolo e renderer
- Avaliar migração de `file://` para protocolo customizado registrado como seguro/standard no Electron.
- CSP do aplicativo real deve ser ajustada ao protocolo e às integrações necessárias; não copiar cegamente `connect-src 'none'` da UI pública.
- Nenhuma integração externa deve liberar `http://`; usar HTTPS e allowlist por provedor.

## Dívidas técnicas abertas no ERP privado
- Reduzir IPC síncrono e operações de disco no thread principal.
- Separar progressivamente o `app.js` privado por domínios.
- Tornar SQLite relacional cada vez mais a fonte transacional primária.
- Homologar Windows 10/11, DPI, impressora térmica, leitor, balança, gaveta e cenários de energia/rede.
- Aplicar Authenticode quando existir certificado comercial NEXO.
- Integrações fiscais/TEF/PIX/marketplaces continuam dependentes de credenciais, contratos e homologação reais.

## Regra de promoção
`9.7 FINAL congelada -> 9.8 LAB -> regressão completa -> 9.8 RC -> teste físico Windows -> 9.8 FINAL`.
