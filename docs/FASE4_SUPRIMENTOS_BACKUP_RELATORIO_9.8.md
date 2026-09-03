# NEXO ERP PRO 9.8 LAB — Fase 4

## Escopo implementado
Esta rodada adiciona ao LAB, sem alterar a 9.7 comercial:
- Suprimentos e Reposição dentro de Estoque;
- alerta visual de estoque baixo/crítico;
- projeto de backup automático diário com histórico;
- Relatório Diário Completo;
- contrato privado SQLite/IPC/CEP;
- schema proposto das novas tabelas;
- regressão estrutural dos 16 módulos;
- validação dos schemas em SQLite temporário.

## Suprimentos
O Estoque agora possui política demonstrativa por SKU com:
- físico;
- reservado;
- disponível = físico - reservado;
- mínimo;
- máximo;
- estoque de segurança;
- quantidade em trânsito;
- estoque projetado;
- lead time;
- fornecedor preferencial/sugerido;
- quantidade de compra sugerida.

A compra sugerida só é aberta quando o estoque disponível atingiu o mínimo. Quantidade em trânsito é considerada no cálculo e nunca soma ao físico antes do recebimento.

## Alertas de estoque
- alerta baixo quando `available <= min_stock`;
- crítico quando `available <= safety_stock`;
- mensagem global com `role="alert"`;
- ação direta para abrir Estoque;
- ciência no LAB vale somente para a sessão;
- contrato privado prevê deduplicação, ACK/snooze e reabertura por mudança de faixa.

## Backup automático diário
A UI do LAB demonstra histórico e estado, mas não cria arquivo real.

Contrato privado exige:
- um backup automático válido por dia local;
- horário configurável;
- catch-up no próximo início se o computador estava desligado;
- Online Backup API ou `VACUUM INTO`, conforme a biblioteca SQLite real;
- `quick_check`/validação equivalente;
- SHA-256;
- rename atômico após validação;
- histórico de sucesso/falha;
- retenção padrão proposta: 30 diários + 12 mensais, configurável;
- teste de restauração em base isolada;
- restauração real somente em fluxo exclusivo/controlado.

## Relatório Diário Completo
O LAB agora apresenta uma visão consolidada de:
- vendas realizadas;
- total vendido;
- produtos/SKUs e unidades vendidas;
- entradas de estoque por compras;
- saídas por vendas;
- perdas e ajustes;
- entradas e saídas financeiras;
- formas de pagamento;
- cancelamentos e valor cancelado;
- ajustes auditados;
- fundo de caixa;
- vendas em dinheiro;
- suprimentos;
- sangrias;
- caixa esperado;
- resumo geral e conferência.

A prévia do LAB confere se a soma das formas de pagamento fecha com o total de vendas. No contrato privado, qualquer divergência gera `reconciliationIssue[]` e o fechamento não deve seguir silenciosamente.

## Banco / contrato
Arquivos:
- `docs/CONTRATO_PRIVADO_SQLITE_IPC_CEP_9.8.md`
- `db/9_8_lab_domain_schema.sql`

Novas estruturas propostas:
- `stock_replenishment_policy`;
- `stock_alert_event`;
- `backup_history`;
- `daily_report_snapshot`.

Essas tabelas ainda são **proposta de integração**. Não devem ser aplicadas cegamente no banco comercial sem mapear o schema privado atual.

## Regressão executada
Workflow GitHub Actions: SUCCESS.

Resultados:
- sintaxe dos 6 scripts JavaScript: PASS;
- varredura estática acumulada: **88/88 PASS**;
- integridade Avaré: **26/26 candidatos UI ↔ SQL PASS**;
- Fase 4: **41/41 PASS**;
- regressão estrutural dos 16 módulos: **63/63 PASS**;
- `avare_public_seed.sql`: executado em SQLite temporário — PASS;
- `9_8_lab_domain_schema.sql`: executado em SQLite temporário — PASS;
- 7/7 tabelas contratuais verificadas no banco temporário — PASS.

## Limite atual
Esta rodada prova consistência estática, estrutural e sintática da camada LAB. Ainda não substitui:
- teste interativo completo em navegador/Electron real;
- integração com o SQLite comercial;
- implementação dos handlers IPC privados;
- geração física de backup;
- restauração real;
- relatório baseado nos dados reais da 9.7/9.8;
- homologação Windows 10/11 e periféricos.

## Próximo gate
Portar o contrato por domínio para o Electron privado em ordem controlada:
1. leitura de Estoque/Suprimentos;
2. alertas e ACK;
3. CEP/cache;
4. backup/histórico;
5. relatório diário read-only;
6. rascunho de compra;
7. regressão completa;
8. RC Windows.
