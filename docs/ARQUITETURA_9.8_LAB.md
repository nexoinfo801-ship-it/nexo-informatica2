# Arquitetura alvo — NEXO ERP PRO 9.8 LAB

## Princípio de release
- 9.7 = linha comercial congelada.
- 9.8 LAB = desenvolvimento.
- 9.8 RC = candidata após regressão completa.
- 9.8 FINAL = somente após teste físico Windows.

## Estado atual da camada pública
- Dashboard executivo implementado.
- PDV, Recebimentos 360, Financeiro e Estoque possuem telas operacionais demonstrativas.
- Nenhuma dessas telas persiste dados reais nesta camada pública.
- Última varredura: 47/47 PASS + sintaxe JavaScript PASS.

## Camadas
### Renderer/UI
- Design System Visual Pro 360.
- Sem novos handlers inline.
- Event delegation.
- DOM seguro sem `innerHTML`/`insertAdjacentHTML` para resultados dinâmicos.
- Pesquisa global e atalhos de teclado.
- Estados: loading, vazio, erro, offline, somente leitura.
- CSP pública restritiva; CSP comercial será ajustada às integrações reais.

### Preload
- API mínima via contextBridge.
- Nenhum fs/process/shell exposto diretamente ao renderer.
- Preferência por ipcRenderer.invoke/Promise em operações de disco/banco.
- Validar tipos/tamanho antes do IPC.

### Main process
- contextIsolation=true.
- nodeIntegration=false.
- sandbox=true onde compatível.
- webSecurity=true.
- Bloquear webview, novas janelas e navegação não permitida.
- Validar sender/origem de IPC.
- Permissões do Electron negadas por padrão.

### Dados
- SQLite/WAL como base operacional prioritária.
- Transações para venda, cancelamento, estoque, compras, caixa e financeiro.
- Snapshot legado apenas para compatibilidade/migração enquanto necessário.
- Backup consistente pelo mecanismo SQLite adequado; nunca copiar DB ativo de forma ingênua.
- Checksum e teste de abertura/restauração do backup.

### Segurança/licenciamento
- Chave privada nunca entra no cliente.
- Licença/status remoto assinados.
- Falha de internet != revogação.
- safeStorage para segredos locais suportados pelo SO.
- Manifesto de release assinado + SHA-256.
- Electron Fuses/Embedded ASAR Integrity somente em pipeline oficial de rebuild, não patch manual.
- Authenticode quando houver certificado comercial NEXO.

## Domínios a separar progressivamente
- ui/
- pdv/
- pedidos/
- estoque/
- compras/
- caixa/
- recebimentos/
- financeiro/
- clientes/
- delivery/
- integracoes/
- ia/
- licenca-suporte/
- persistence/

## Regras financeiras obrigatórias
- Venda != recebimento.
- Dinheiro físico só entra no caixa quando efetivamente recebido.
- Cartão permanece previsto/pendente até conciliação.
- Marketplace permanece repasse até liquidação.
- Fiado permanece contas a receber até baixa.
- Cancelamento/retificação deve ser transacional e auditável.

## Regra de estoque obrigatória
- Disponível = físico - reservado.
- Em trânsito é informativo/previsão e não aumenta o físico antes do recebimento.
- Cancelamentos devem reverter reservas/movimentos na mesma transação.

## NEXO IA
- Pode consultar e explicar indicadores.
- Pode sugerir reposição, cobrança, follow-up e ações.
- Pode preparar rascunhos.
- Não pode finalizar venda, baixar caixa, emitir fiscal, movimentar estoque ou alterar financeiro sem confirmação humana explícita.
