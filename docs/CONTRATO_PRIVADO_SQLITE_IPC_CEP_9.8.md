# NEXO ERP PRO 9.8 — Contrato de integração privada

> Documento público seguro: descreve interfaces e invariantes, não contém segredo, chave, token, SQL do banco comercial existente nem implementação do servidor de licença.

## Objetivo
Levar o Visual Pro 360 e os módulos do 9.8 LAB ao Electron privado sem quebrar a 9.7 estável. O renderer nunca acessa SQLite, filesystem, rede postal ou segredos diretamente.

## Princípios obrigatórios
- SQLite/WAL continua no processo/controlador privado.
- Todo IPC privilegiado valida `senderFrame`/origem, payload, permissão e estado da licença quando aplicável.
- Preload expõe funções específicas via `contextBridge`; não expõe `ipcRenderer` genérico.
- Escritas de venda, estoque, caixa, financeiro, compras e cancelamentos permanecem transacionais e auditáveis.
- Nenhuma chamada de CEP ou integração externa parte diretamente do renderer.
- Falha de internet não equivale a revogação de licença.

## Contratos IPC propostos

### Estoque e Suprimentos
`nexo:stock:getAlerts({warehouseId?}) -> StockAlert[]`
- read-only;
- retorna somente alertas ativos do contexto autorizado.

`nexo:stock:ackAlert({alertId, action, snoozeMinutes?}) -> {ok}`
- `action`: `ack | snooze`;
- exige validação de usuário/sessão;
- nunca altera quantidade de estoque.

`nexo:supply:getSuggestions({warehouseId?}) -> SupplySuggestion[]`
- calcula disponível = físico - reservado;
- considera mínimo, máximo, estoque de segurança, lead time e quantidade em trânsito;
- fornecedor preferencial é sugestão, nunca homologação automática.

`nexo:supply:createPurchaseDraft({items:[{sku,qty}], supplierId?}) -> {draftId}`
- cria somente rascunho;
- exige permissão `purchase.create`;
- nunca aumenta estoque físico antes do recebimento transacional.

### Backup
`nexo:backup:getStatus() -> BackupStatus`
`nexo:backup:listHistory({limit}) -> BackupRecord[]`
`nexo:backup:runNow({reason:'manual'}) -> BackupRecord`
`nexo:backup:validateRestore({backupId}) -> ValidationResult`

Regras:
- execução fora do renderer;
- não copiar ingenuamente arquivo SQLite ativo;
- usar mecanismo consistente suportado pela biblioteca SQLite, como Online Backup API ou `VACUUM INTO`;
- após gerar: abrir/validar, `PRAGMA quick_check` ou equivalente, calcular SHA-256 e só então marcar como `verified`;
- nome temporário + rename atômico após validação;
- histórico no banco com status e hash;
- retenção padrão proposta: 30 backups diários + 12 mensais, configurável;
- um backup automático por dia local;
- se o PC estiver desligado no horário, executar catch-up no próximo início, desde que ainda não exista backup válido daquele dia;
- restauração somente em fluxo exclusivo/controlado, nunca sobre banco aberto pela aplicação.

### Relatório diário
`nexo:report:daily({date, mode:'live'|'closed'}) -> DailyReport`
`nexo:report:closeDay({date}) -> DailyReportSnapshot`

O relatório deve derivar das fontes transacionais canônicas, não de números soltos na UI. Deve consolidar pelo menos:
- vendas realizadas;
- entradas e saídas de estoque;
- produtos e quantidades vendidos;
- movimentações e ajustes do estoque;
- entradas e saídas financeiras;
- total vendido;
- formas de pagamento;
- cancelamentos, devoluções e retificações;
- abertura, suprimentos, sangrias, dinheiro recebido e fechamento de caixa;
- resumo geral e divergências.

Invariantes de conferência:
- soma das formas de pagamento = total líquido das vendas consideradas, respeitando cancelamentos/retificações;
- dinheiro físico não inclui cartão, marketplace, fiado ou recebível não liquidado;
- estoque vendido/estornado deve reconciliar com movimentos de venda/cancelamento;
- qualquer diferença relevante vira `reconciliationIssue[]` e não é escondida;
- snapshot fechado recebe revisão, timestamp, high-water mark de auditoria e SHA-256.

### CEP / Avaré-SP
`nexo:cep:lookup({cep}) -> PostalAddressSuggestion`

Fluxo:
1. normalizar CEP para 8 dígitos;
2. consultar cache SQLite válido;
3. se necessário, consultar provider HTTPS allowlisted com timeout;
4. validar resposta e UF/cidade quando o contexto exigir Avaré/SP;
5. gravar/atualizar cache com fonte e data;
6. retornar logradouro/bairro/cidade/UF;
7. **número e complemento permanecem campos informados/confirmados pelo usuário**.

Providers planejados: ViaCEP primário, BrasilAPI fallback e, quando contratado/autorizado, Correios DNE/API para carga/validação mais autoritativa. A UI pública permanece com `connect-src 'none'`.

## Política de alerta de estoque
- `available = physical - reserved`;
- alerta baixo quando `available <= min_stock`;
- crítico quando `available <= safety_stock`;
- alerta deduplicado por `warehouse + sku + threshold_state`;
- ACK não remove a condição; apenas registra ciência;
- nova queda de faixa ou mudança significativa pode reabrir o alerta;
- interface deve indicar itens em trânsito e não tratá-los como físico;
- sugestão de compra considera estoque projetado e lead time.

## Regressão obrigatória antes de RC
- 16 módulos abrem sem tela vazia;
- rotas/hash e busca global funcionam;
- PDV continua sem misturar venda e recebimento;
- cancelamento/reversão mantém estoque, financeiro e caixa coerentes;
- Suprimentos não altera físico antes do recebimento;
- alertas não duplicam em loop;
- backup gera registro verificado e restauração de teste em base isolada;
- relatório diário reconcilia pagamentos, caixa, estoque e financeiro;
- CEP nunca preenche número do imóvel automaticamente;
- IPC rejeita sender/payload não autorizado;
- teste físico Windows 10/11 continua gate obrigatório antes de FINAL.
