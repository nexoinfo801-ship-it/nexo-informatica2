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
A tabela `order_lifecycle` passa a representar o ciclo operacional compartilhado:

`NEW → CONFIRMED → PREPARING → READY → WAITING_DRIVER → OUT_FOR_DELIVERY → DELIVERED → PAID → FINALIZED`

Para salão existe `READY → SERVING → PAID → FINALIZED`.

`CANCELLED` exige permissão, motivo e auditoria. A lista de transições permitidas fica em `order_state_transition_allowed`, e o SQLite possui trigger que rejeita transição inválida e exige incremento de versão.

O estado de pagamento é separado (`PENDING/PARTIAL/PAID/REFUNDED/FAILED`), porque um PIX pode estar confirmado enquanto a entrega ainda está em rota.

## Origens do pedido
`COUNTER / WAITER / PHONE / WHATSAPP / SITE / APP / DELIVERY / MARKETPLACE / OTHER`.

WhatsApp entra como origem do mesmo pedido; integração real com provedor fica fora da camada pública.

## Cliente e múltiplos endereços
`delivery_customer_profile` + `delivery_customer_address` suportam Casa, Trabalho e outros endereços. Campos: telefone/WhatsApp, CEP, rua, número, complemento, bairro, cidade/UF, referência e observações.

**Número nunca é inferido automaticamente pelo CEP.**

## Taxa de entrega
`delivery_fee_rule` suporta valor por bairro, prioridade, entrega grátis e limite de valor para gratuidade. Os valores do seed são apenas demonstração.

A camada privada deve calcular a taxa no servidor e salvar snapshot no pedido/entrega. O celular não decide a taxa final.

## Entregadores
`delivery_driver` possui usuário próprio, status `AVAILABLE/DELIVERING/OFFLINE`, veículo, placa opcional e região. `delivery_driver_compensation_rule` suporta:
- fixo por entrega;
- valor por km;
- valor por região.

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

Fluxo visual:
1. login/sessão;
2. minhas entregas;
3. abrir pedido;
4. abrir rota;
5. iniciar entrega;
6. marcar chegada;
7. concluir ou registrar ocorrência;
8. informar recebimento quando aplicável;
9. aguardar conciliação/acerto com caixa.

## Garçom Mobile
Permissões continuam restritas a mesas/comandas/pedidos. Solicitar fechamento não libera a mesa. O caixa confirma pagamento e finaliza a comanda.

## Rota
No LAB, “Abrir rota” não navega para serviço externo. Na camada privada/mobile, a ação deve montar um deep link explícito para o aplicativo de mapas escolhido pelo usuário usando o endereço já confirmado. Não armazenar coordenadas precisas sem necessidade operacional e política de privacidade adequada.

## Idempotência
Toda operação mobile crítica recebe `idempotency_key` e `request_hash` em `mobile_operation_guard`.

Exemplos:
- enviar pedido;
- iniciar entrega;
- marcar chegada;
- concluir entrega;
- registrar recebimento;
- solicitar fechamento.

Repetição da mesma chave devolve o resultado anterior; não cria nova operação.

## Concorrência
`order_lifecycle.version` é usado em optimistic concurrency. O serviço privado deve executar `UPDATE ... WHERE order_id=? AND version=?` e rejeitar versão desatualizada.

Há índice parcial que impede dois assignments ativos para o mesmo pedido. Para mesa, a regra já existente deve impedir duas comandas operacionais concorrentes.

## Ocorrências
`delivery_occurrence` cobre:
- cliente não atende;
- endereço incorreto;
- cliente ausente;
- cliente recusou;
- item faltando;
- atraso;
- problema do entregador;
- cancelamento;
- pagamento não realizado;
- outros.

Toda ocorrência possui autor, horário, severidade e resolução.

## Dinheiro do entregador
`delivery_payment_collection` separa:
- valor do pedido;
- valor recebido;
- troco;
- forma de pagamento;
- recebido pelo entregador ou não;
- transferência ao caixa;
- conciliação.

`delivery_driver_settlement` fecha o período do entregador e registra dinheiro esperado, dinheiro entregue, diferença e remuneração devida.

Dinheiro recebido pelo entregador não é considerado automaticamente caixa físico da loja antes da prestação de contas.

## Comprovante de entrega
`delivery_proof` permite referência opcional a status, assinatura ou foto. Foto/assinatura devem ser recursos configuráveis e, se habilitados, seguir política de retenção e privacidade. A camada pública não armazena binários.

## Estoque
O fluxo usa a arquitetura profissional já definida:
- pedido reserva estoque;
- confirmação/produção consome conforme regra do produto/ficha técnica;
- não permitir estoque negativo sem permissão explícita;
- marmita pode baixar ingredientes + embalagem + descartáveis pela ficha técnica;
- toda movimentação é auditável.

## Financeiro/Caixa
Delivery não cria financeiro paralelo. A venda entra no mesmo núcleo:
- forma(s) de pagamento;
- taxa de entrega;
- valor a receber;
- cartão/PIX separados de dinheiro físico;
- dinheiro do entregador entra em acerto;
- taxas/remuneração do entregador podem ir a centro de custo Delivery;
- relatório/DRE recebem os lançamentos canônicos.

## Tratamento de erro
A UI não mostra stack trace, SQLite error, KeyError etc. Exemplo de mensagem operacional:

> Não foi possível concluir a operação. O pedido não foi duplicado. Verifique a conexão e tente novamente.

O erro técnico fica no log/auditoria com correlation id.

## API privada alvo
O Windows, Garçom Mobile, Cozinha/KDS e Entregador Mobile devem consumir a mesma API/serviço de domínio. Exemplos de comandos:
- `order.confirm`
- `order.transition`
- `delivery.assign`
- `delivery.start`
- `delivery.arrive`
- `delivery.complete`
- `delivery.occurrence.create`
- `delivery.payment.collect`
- `delivery.settlement.close`
- `customer.address.upsert`
- `delivery.fee.quote`

Cada handler valida sessão, perfil, permissão, payload, idempotência, versão e estado atual antes de abrir a transação SQLite.

## Segurança
- não confiar em preço/taxa/status enviados pelo celular;
- recalcular e validar no servidor;
- sessões revogáveis e vinculáveis ao dispositivo;
- rate limit local/API;
- CORS/origin allowlist na LAN/PWA;
- CSRF/anti-replay conforme transporte escolhido;
- TLS quando o serviço sair do loopback/rede confiável;
- logs sem segredos/tokens.

## Testes mínimos antes da RC
- login/permissão/sessão expirada;
- duplo clique e retry de rede;
- transição inválida;
- dois entregadores para o mesmo pedido;
- dois dispositivos atualizando a mesma versão;
- pedido cancelado com motivo;
- cliente com múltiplos endereços;
- taxa por bairro/gratuidade;
- dinheiro/troco/acerto do entregador;
- ocorrência;
- pagamento prévio e pagamento na entrega;
- estoque/ficha técnica;
- integração com caixa/financeiro;
- relatório e auditoria;
- modo offline/reconexão explícita sem falsa confirmação.

## Limite do LAB
Nenhum botão público altera venda real, estoque real, caixa real, abre mapas externos ou inicia servidor LAN. A camada pública valida UX/contrato. Persistência e comunicação real entram no Electron/serviço privado após migração e homologação.
