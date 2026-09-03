# NEXO ERP PRO 9.8 LAB — Fase 9 Delivery Pro + Entregador Mobile

## Objetivo
Transformar Delivery em um fluxo transacional ligado ao mesmo pedido usado por atendimento, produção, estoque, financeiro, caixa e relatório.

## Regra estrutural
Um pedido possui **um único `order_id`** durante toda a operação. Cozinha, Bar, Delivery, Caixa e Relatórios não criam cópias do pedido.

```text
GARÇOM / BALCÃO / TELEFONE / WHATSAPP / SITE / APP
                      ↓
                 PEDIDO ÚNICO
                      ↓
             COZINHA / BAR / KDS
                      ↓
                DELIVERY PRO
                      ↓
              ENTREGADOR MOBILE
                      ↓
              PAGAMENTO / CAIXA
                      ↓
         ESTOQUE + FINANCEIRO + RELATÓRIO
```

## Ciclo canônico
A tabela `order_lifecycle` representa o ciclo operacional compartilhado:

`NEW → CONFIRMED → PREPARING → READY → WAITING_DRIVER → OUT_FOR_DELIVERY → DELIVERED → PAID → FINALIZED`

Para salão existe `READY → SERVING → PAID → FINALIZED`.

`CANCELLED` exige permissão, motivo e auditoria. A lista de transições permitidas fica em `order_state_transition_allowed`; o SQLite rejeita transição inválida e exige incremento de versão.

O estado de pagamento é separado (`PENDING/PARTIAL/PAID/REFUNDED/FAILED`), porque um PIX pode estar confirmado enquanto a entrega ainda está em rota.

## Origens do pedido
`COUNTER / WAITER / PHONE / WHATSAPP / SITE / APP / DELIVERY / MARKETPLACE / OTHER`.

WhatsApp entra como origem do mesmo pedido; integração real com provedor fica fora da camada pública.

## Cliente e múltiplos endereços
`delivery_customer_profile` + `delivery_customer_address` suportam Casa, Trabalho e outros endereços. Campos: telefone/WhatsApp, CEP, rua, número, complemento, bairro, cidade/UF, referência e observações.

**Número nunca é inferido automaticamente pelo CEP.**

## Taxa de entrega
`delivery_fee_rule` suporta valor por bairro, prioridade, entrega grátis e limite de valor para gratuidade. Os valores do seed são apenas demonstração.

A camada privada calcula a taxa no servidor e salva snapshot no pedido/entrega. O celular não decide a taxa final.

## Entregadores
`delivery_driver` possui usuário próprio, status `AVAILABLE/DELIVERING/OFFLINE`, veículo, placa opcional e região. `delivery_driver_compensation_rule` suporta fixo por entrega, valor por km e valor por região.

A sugestão automática pode ordenar por disponibilidade, região, quantidade de entregas ativas e SLA recente, mas o gerente mantém a palavra final.

## Entregador Mobile
Permissões mínimas no servidor:
- `DELIVERY_VIEW_ASSIGNED`;
- `DELIVERY_START`;
- `DELIVERY_ARRIVE`;
- `DELIVERY_COMPLETE`;
- `DELIVERY_OCCURRENCE_CREATE`;
- `DELIVERY_COLLECT_PAYMENT`.

Não pode alterar preços, produtos, estoque, financeiro global, usuários ou relatórios administrativos.

Fluxo: login/sessão → minhas entregas → pedido → rota → iniciar → chegar → concluir/ocorrência → recebimento → acerto com caixa.

## Garçom Mobile
Permissões continuam restritas a mesas/comandas/pedidos. Solicitar fechamento não libera a mesa. O caixa confirma pagamento e finaliza a comanda.

## Rota
No LAB, “Abrir rota” não navega para serviço externo. Na camada privada/mobile, a ação monta um deep link explícito para o aplicativo de mapas usando endereço já confirmado.

## Idempotência
Toda operação mobile crítica recebe `idempotency_key` e `request_hash` em `mobile_operation_guard`. Repetição da mesma chave devolve o resultado anterior; não cria nova operação.

## Concorrência
`order_lifecycle.version` é usado em optimistic concurrency. O serviço privado executa atualização condicionada à versão esperada. Há índice parcial que impede dois assignments ativos para o mesmo pedido.

## Ocorrências
`delivery_occurrence` cobre cliente não atende, endereço incorreto, cliente ausente/recusa, item faltando, atraso, problema do entregador, cancelamento, pagamento não realizado e outros. Toda ocorrência possui autor, horário, severidade e resolução.

## Dinheiro do entregador
`delivery_payment_collection` separa valor do pedido, valor recebido, troco, forma de pagamento, recebimento pelo entregador, transferência ao caixa e conciliação.

`delivery_driver_settlement` fecha o período do entregador e registra dinheiro esperado, dinheiro entregue, diferença e remuneração devida.

Dinheiro recebido pelo entregador não é considerado automaticamente caixa físico da loja antes da prestação de contas.

## Comprovante de entrega
`delivery_proof` permite referência opcional a status, assinatura ou foto. Foto/assinatura ficam configuráveis e devem seguir retenção/privacidade. A camada pública não armazena binários.

## Estoque
Pedido reserva estoque; confirmação/produção consome conforme produto/ficha técnica; estoque negativo exige permissão explícita; marmita pode baixar ingredientes + embalagem + descartáveis; toda movimentação é auditável.

## Financeiro/Caixa
Delivery não cria financeiro paralelo. A venda usa o mesmo núcleo de pagamentos, taxa de entrega, recebimentos, acerto do entregador, centro de custo Delivery, DRE e relatórios.

## Tratamento de erro
A UI não mostra stack trace/SQLite error. Mensagem operacional alvo:

> Não foi possível concluir a operação. O pedido não foi duplicado. Verifique a conexão e tente novamente.

O erro técnico fica no log/auditoria com correlation id.

## API privada alvo
Windows, Garçom Mobile, Cozinha/KDS e Entregador Mobile consomem a mesma API/serviço de domínio. Comandos alvo: `order.confirm`, `order.transition`, `delivery.assign`, `delivery.start`, `delivery.arrive`, `delivery.complete`, `delivery.occurrence.create`, `delivery.payment.collect`, `delivery.settlement.close`, `customer.address.upsert`, `delivery.fee.quote`.

Cada handler valida sessão, perfil, permissão, payload, idempotência, versão e estado atual antes da transação SQLite.

## Segurança
- não confiar em preço/taxa/status enviados pelo celular;
- recalcular e validar no servidor;
- sessões revogáveis e vinculáveis ao dispositivo;
- rate limit local/API;
- CORS/origin allowlist na LAN/PWA;
- proteção anti-replay conforme transporte;
- TLS quando o serviço sair do loopback/rede confiável;
- logs sem segredos/tokens.

## Validação executada no LAB
- Fase 9 UI/contrato: **39/39 PASS**;
- Delivery Pro SQLite: **14/14 tabelas**;
- **17 transições** permitidas;
- **4 regras de taxa DEMO** e **3 entregadores DEMO**;
- transição inválida rejeitada;
- versionamento incorreto rejeitado;
- idempotência duplicada rejeitada;
- segundo assignment ativo do mesmo pedido rejeitado;
- múltiplos endereços validados;
- troco inconsistente rejeitado;
- enum de ocorrência inválido rejeitado;
- regressão dos 16 módulos: **64/64 PASS**;
- workflow acumulado: **SUCCESS**.

## Limite do LAB
Nenhum botão público altera venda real, estoque real, caixa real, abre mapas externos ou inicia servidor LAN. Persistência/comunicação real entram no Electron/serviço privado após migração e homologação.
