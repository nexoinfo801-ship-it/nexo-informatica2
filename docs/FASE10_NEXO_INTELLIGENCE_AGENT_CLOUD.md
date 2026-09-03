# NEXO ERP PRO 9.8 LAB — Fase 10 NEXO Intelligence + Agent + Cloud

## Princípio central
**Operação crítica = regras determinísticas. Inteligência/análise = IA.**

A IA não controla diretamente licenciamento, permissões, exclusão, restauração, fechamento financeiro ou bloqueios. Ela observa, analisa, resume, detecta padrões, sugere e solicita autorização.

## Componentes
- **NEXO Core:** operação local e banco operacional.
- **NEXO Agent:** heartbeat, métricas minimizadas, backup, atualização, diagnóstico e recovery.
- **NEXO Cloud/API:** tenants, planos, licenças, dispositivos, suporte, backups, versões, alertas e auditoria central.
- **NEXO Intelligence:** análise de uso, saúde, backup, suporte e recomendações.
- **NEXO Master:** painel administrativo da plataforma.

## Licenciamento
Estados: `TRIAL / ACTIVE / EXPIRING / EXPIRED / SUSPENDED / CANCELLED`.

Planos alvo: teste, mensal, trimestral, semestral, anual e vitalício quando comercialmente habilitado.

A licença é avaliada por motor de regras. A IA pode explicar risco de vencimento, baixa utilização ou necessidade de contato, mas não revoga ou bloqueia licença.

## Uso e privacidade
A Central recebe métricas agregadas, por exemplo:
- dias/sessões ativos;
- contagem de pedidos/vendas;
- módulos utilizados;
- contagem de ações de estoque/caixa/delivery;
- última comunicação;
- versão instalada.

Não é necessário enviar cliente final, telefone, endereço, itens de pedido ou conteúdo detalhado de vendas para calcular utilização.

O `NEXO Usage Score` é calculado por regras objetivas e persistido com `rule_version`. A IA apenas interpreta o score.

## Backup
Fluxo alvo:
`Banco local → backup consistente → compressão → criptografia → upload → verificação → registro → teste de restauração periódico`.

Metadados: data/hora, tamanho, SHA-256, criptografia, upload, integridade, teste de restauração e referência do objeto remoto.

Antes de atualização: backup válido obrigatório. Falha de backup bloqueia a atualização, não a operação comercial do cliente.

## Recuperação
`Nova máquina → instalação → autenticação → licença → localizar backup → restaurar → validar → testar → operar`.

O objetivo é permitir recuperação quando a máquina antiga morreu, sem depender do computador original.

## Monitoramento
O Agent pode enviar:
- Windows/NEXO/schema;
- espaço livre;
- heartbeat;
- estado do serviço;
- backup;
- erros críticos agregados.

Alertas: `INFO / WARNING / HIGH / CRITICAL`.

## Suporte inteligente
A IA pode receber dados controlados como versão, erros recentes, backup, saúde, uso e tickets. Ela gera diagnóstico/recomendação. Ações críticas permanecem sob técnico/administrador e backend.

## Atualização
Fluxo alvo:
`Nova versão → compatibilidade → backup → validação → atualização → health check → confirmação/rollback quando suportado`.

## Multi-tenancy
Toda operação central é vinculada a `tenant_id`. A API deve validar tenant no backend e impedir leitura cruzada entre empresas.

## Segurança
- chave do provedor de IA nunca no executável do cliente;
- tokens e segredos fora do repositório público;
- TLS para comunicação remota;
- sessões e dispositivos controlados;
- auditoria central;
- acesso remoto somente sob solicitação/autorização temporária;
- logs sem segredos;
- minimização de telemetria.

## UI LAB
A Fase 10 acrescenta:
- resumo NEXO Intelligence no Dashboard;
- painel de licenças, backups, versões, uso e alertas dentro de **NEXO IA**;
- NEXO Agent, privacidade e recovery dentro de **Licença/Suporte**;
- recomendações ficam em `PROPOSED` e exigem revisão humana.

## Limite do LAB
A UI pública não conecta à nuvem, não envia telemetria, não faz upload de backup, não revoga licença e não executa atualização. O objetivo é validar schema, contrato, UX e invariantes antes da implementação privada.
