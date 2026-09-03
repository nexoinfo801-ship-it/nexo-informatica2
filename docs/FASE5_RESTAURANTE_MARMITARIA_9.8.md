# NEXO ERP PRO 9.8 LAB — Fase 5 Restaurante/Marmitaria

## Decisão de arquitetura
A Fase 5 transforma o NEXO de ERP predominantemente administrativo em uma operação integrada de restaurante/marmitaria, sem aumentar o menu principal além dos 16 módulos atuais.

Fluxo-alvo:

`GARÇOM → PEDIDO → ROTEADOR → COZINHA/BAR → PRONTO → GARÇOM → CAIXA → ESTOQUE + FINANCEIRO + RELATÓRIO + BACKUP`

Cada transição operacional deverá gerar auditoria com ator, terminal, data/hora, antes/depois e motivo quando aplicável.

## Onde cada função fica
- **Pedidos**: núcleo Restaurante com Salão, Garçom Mobile, Cozinha KDS, Bar, Impressão e Cardápio Temático.
- **Produtos**: setor de preparo, modificadores, ficha técnica, CMV, margem e markup.
- **Estoque**: consumo por ficha técnica, perdas/desperdício e Suprimentos.
- **Caixa**: recebe a conta/comanda pronta para fechamento; não controla produção.
- **Relatórios**: métricas de salão, cozinha, bar, delivery, perdas e conferência financeira.
- **Integrações**: estado técnico separado em Implementado, Configurado, Testado, Homologado e Não configurado.

## Salão e Garçom
Estados da mesa:
- `FREE` — Livre
- `OCCUPIED` — Ocupada
- `ORDER_SENT` — Pedido enviado
- `PREPARING` — Em preparo
- `READY` — Pronto
- `SERVING` — Servindo
- `CLOSING` — Fechamento

O garçom trabalha em interface touch/mobile. O pedido é vinculado à mesa, garçom e itens. Transferência/divisão/unificação de comanda será portada apenas depois que o contrato base estiver integrado ao SQLite privado.

## Modificadores de marmita
Modificador estruturado substitui observação livre como mecanismo principal.

Cada grupo define:
- mínimo de escolhas;
- máximo de escolhas;
- obrigatório/opcional;
- cota grátis;
- preço adicional;
- setor de preparo;
- ordem visual.

Exemplos:
- Proteína: Bife, Frango, Linguiça, Ovo.
- Acompanhamentos: Arroz, Feijão, Salada, Farofa.
- Remoções: Sem cebola, Sem alho, Sem refogado.
- Extras/substituições: adicional de carne, trocar ovo por carne.
- Bebidas: gelo, limão, açúcar/sem açúcar.

Texto livre permanece apenas como observação excepcional.

## Roteador de produção
Cada item possui `production_sector`:
- `KITCHEN`
- `BAR`
- `EXPEDITION`
- `NONE`

Um único pedido pode gerar tickets separados por setor sem perder o vínculo com a mesma mesa/comanda.

Exemplo:
- Marmita → Cozinha
- Coca-Cola → Bar
- Suco → Bar
- Sobremesa → Bar ou Expedição conforme cadastro

## KDS
Estados por ticket/item:
- `NEW`
- `ACCEPTED`
- `PREPARING`
- `READY`
- `DELIVERED`
- `CANCELLED`

Cozinha e Bar veem apenas itens de seus respectivos setores. O estado global do pedido é derivado dos tickets. Quando todos os tickets obrigatórios estiverem prontos, o garçom recebe o estado `READY`.

## Impressão por setor
Destinos:
- `CASHIER`
- `KITCHEN`
- `BAR`
- `EXPEDITION`

O contrato prevê fila persistente de impressão, tentativas, falha explícita e reimpressão auditada. Impressão física continua exigindo homologação Windows/ESC-POS no hardware real.

## Ficha técnica / custo
Produtos preparados terão receita/ficha técnica com:
- ingredientes;
- quantidade/unidade;
- perda técnica;
- custo do ingrediente;
- rendimento;
- embalagem;
- mão de obra/overhead quando configurado.

O NEXO deverá exibir separadamente:
- **Lucro bruto** = preço de venda − custo;
- **Margem sobre venda** = lucro bruto / preço de venda;
- **Markup sobre custo** = lucro bruto / custo.

Exemplo: custo R$ 10, venda R$ 15 → lucro R$ 5, margem 33,33%, markup 50%.

## Perdas
Toda perda deve registrar:
- produto/insumo;
- quantidade/unidade;
- custo unitário;
- custo total;
- motivo;
- responsável;
- data/hora;
- observação;
- evento de auditoria.

Perdas alimentam CMV/resultado gerencial e Relatório Diário.

## Cardápio Temático
Eventos têm:
- nome;
- data/hora inicial e final;
- preço fixo;
- produtos elegíveis;
- ativo/inativo.

Exemplos de negócio: Almoço Mexicano, Italiano e Caipira. A ativação por janela de venda deve ser determinística e auditável.

## Relatório Diário — extensão Restaurante
Além da Fase 4, incluir:
- pedidos de salão;
- ticket médio;
- descontos;
- itens produzidos pela Cozinha;
- tempo médio de cozinha;
- tickets atrasados;
- itens produzidos pelo Bar;
- tempo médio do Bar;
- entregas concluídas/canceladas/atrasadas e taxas;
- perdas/desperdício e custo total;
- conferência entre venda, pagamento, caixa, estoque e produção.

## Integrações — estados inequívocos
Cada integração deve possuir estados independentes:
- `IMPLEMENTED`
- `CONFIGURED`
- `TESTED`
- `HOMOLOGATED`
- `NOT_CONFIGURED`

Nunca usar apenas uma porcentagem que possa sugerir prontidão comercial. “Implementado” significa contrato/código existente; “Homologado” exige teste real com credenciais/provedor/hardware quando aplicável.

## Segurança e rede local
A camada pública do LAB permanece sem rede. No Electron privado, Garçom mobile/multi-terminal deverá usar um serviço local autenticado e autorizado, com proteção anti-split-brain, TLS ou rede confiável conforme arquitetura definida na implantação. Não expor SQLite diretamente ao navegador/celular.

## Referências históricas do próprio NEXO
Linhas anteriores já testaram Salão/Comandas, Cozinha KDS, modificadores, divisão/unificação/transferência de comanda, ficha técnica, perdas e KDS por estação. A Fase 5 reutiliza os **contratos funcionais** maduros dessas linhas, mas não copia binários/instaladores/segredos nem substitui a regressão do 9.8.

## Limite desta fase pública
- nenhuma venda/comanda é persistida;
- nenhum estoque real é baixado;
- nenhuma impressão física ocorre;
- nenhum dispositivo móvel se conecta em rede;
- nenhum dado de cliente/funcionário real é usado;
- o schema é proposta de integração e precisa ser mapeado ao banco privado antes da migração.
