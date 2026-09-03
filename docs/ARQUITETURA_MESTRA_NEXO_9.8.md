# NEXO — Arquitetura Mestra 9.8 LAB

## Plataforma
Windows 10/11 + Mobile/Web, modular, API-first, multiempresa e com banco local como repositório operacional principal.

## Ecossistema
- NEXO Core
- NEXO Agent
- NEXO Cloud/API
- NEXO Intelligence
- NEXO Suporte
- NEXO Licensing
- NEXO Backup
- Garçom Mobile
- Entregador Mobile
- NEXO Master

## Regra arquitetural
**Regras críticas são determinísticas. IA é analítica e assistiva.**

## Núcleo local
Produtos, clientes, fornecedores, estoque, fichas técnicas, pedidos, mesas/comandas, produção/KDS, delivery, caixa, recebimentos, financeiro, relatórios, configurações, usuários e auditoria compartilham o mesmo núcleo de regras e banco.

## API única
Windows, Garçom Mobile, Entregador Mobile, KDS e Agent usam a mesma camada de serviço/domínio. Nenhum terminal mobile é autoridade sobre preço, estoque, pagamento, taxa, licença ou permissões.

## Pedido único
Um `order_id` acompanha atendimento, cozinha/bar, delivery, caixa, estoque, financeiro e relatório. Estados são validados no backend, com idempotência e controle de concorrência.

## Banco local
Domínios principais:
- clientes/endereços;
- usuários/perfis/permissões/sessões;
- produtos/categorias/marcas/fornecedores;
- estoque/movimentos/lotes/fichas técnicas;
- mesas/comandas/pedidos/itens/status;
- entregas/entregadores/ocorrências;
- pagamentos/caixa/movimentos;
- contas a pagar/receber/centros de custo;
- configurações/auditoria.

## Banco central
Domínios principais:
- tenants;
- planos/licenças/dispositivos;
- heartbeat/saúde;
- métricas de uso minimizadas;
- backups/testes de restauração;
- suporte;
- versões/deployments;
- notificações;
- auditoria;
- recomendações e custo de IA.

## Backup/Recovery
Backup não é considerado válido apenas por existir. Deve possuir integridade, SHA-256, leitura/validação e teste de restauração periódico. Recuperação em nova máquina faz parte do produto.

## Segurança
- autenticação e sessão;
- permissões server-side;
- segregação por tenant;
- criptografia em trânsito;
- backup criptografado;
- segredos fora do cliente;
- auditoria;
- acesso remoto temporário e autorizado;
- mensagens amigáveis ao usuário e erro técnico em log.

## Resiliência
O NEXO deve lidar com queda de internet, reinício, API temporariamente indisponível, falha de impressão, timeout, retransmissão, falha de atualização e restauração de backup sem duplicar operações.

## Critério para comercialização
Uma versão só pode ser promovida para RC/FINAL quando provar:
1. persistência correta;
2. ausência de erro crítico conhecido;
3. backup e restauração testados;
4. licenciamento funcional;
5. permissões validadas;
6. pedido sem duplicação;
7. estoque consistente;
8. caixa consistente;
9. logs/auditoria funcionando;
10. suporte integrado;
11. IA limitada às funções autorizadas;
12. Windows 10/11 homologados;
13. recuperação testada.

## Estado 9.8 LAB
As Fases 4–10 estruturam Suprimentos/Backup/Relatório, Restaurante/KDS, Drivers, Garçom Mobile, Produtos/Estoque, Delivery Pro e NEXO Intelligence. O P0 do instalador `Count` continua bloqueante para RC Windows até correção no script privado e teste físico.
