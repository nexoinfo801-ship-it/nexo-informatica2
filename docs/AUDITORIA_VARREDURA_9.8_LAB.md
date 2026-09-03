# NEXO ERP PRO 9.8 LAB — Auditoria e Varredura Crítica

## Escopo
Esta auditoria cobre a camada pública UI/UX do 9.8 LAB, a base pública local de Avaré/SP e os requisitos para futura integração com o Electron/SQLite privado. Ela **não afirma** que o `app.asar` comercial 9.7 já foi alterado.

## Estado atual do LAB
Os 16 módulos da navegação possuem experiência própria ou operação demonstrativa no LAB:

1. Dashboard
2. PDV / Nova Venda
3. Pedidos
4. Produtos
5. Estoque
6. Compras
7. Caixa
8. Recebimentos 360
9. Financeiro
10. Delivery
11. Clientes / CRM
12. Fornecedores
13. Relatórios
14. NEXO IA
15. Integrações
16. Licença e Suporte

Todas as mutações continuam locais/demonstrativas. A camada pública não grava venda, compra, baixa financeira, movimento real de estoque/caixa, dado privado de cliente ou segredo de licenciamento.

## Módulos e regras principais

### PDV
- Busca por nome/SKU e carrinho responsivo.
- Quantidade limitada ao estoque demonstrativo, com aviso de limite.
- Dinheiro, PIX, débito, crédito e fiado como opções visuais.
- Suspensão/limpeza somente em memória.
- Finalização valida UX/resumo e **não persiste venda real**.

### Recebimentos 360 / Financeiro
- Venda, previsão e liquidação permanecem separadas.
- Bruto/líquido, cartões em conciliação, marketplace em repasse e fiado a receber.
- Aging, fluxo projetado, contas a receber/pagar, margem e compromissos.
- Caixa físico não recebe automaticamente cartão/marketplace/fiado.

### Estoque / Produtos / Compras
- Físico, reservado, disponível e em trânsito.
- `disponível = físico - reservado`.
- Em trânsito não aumenta físico antes do recebimento.
- Catálogo com custo, preço, margem e estoque.
- Limiar nomeado `LOW_MARGIN=55` usado por indicador e filtro.
- Aprovação/recebimento de compra são simulações no LAB.

### Pedidos / Delivery
- Fila, canal, SLA, prioridade, ETA e evolução de status em memória.
- Filtro de atenção exclui pedidos entregues.
- Delivery recebeu painel de operadores candidatos de Avaré, sempre como **não homologados**.

### Clientes / Fornecedores
- CRM demonstrativo sem PII real.
- Recência, frequência, valor, crédito e risco.
- Fornecedores com lead time, score e valores em aberto.
- Painel local de Avaré para embalagens, supermercados, carnes e gás.

### Relatórios
- Prévia para vendas/margem, recebimentos, estoque/giro, compras/fornecedores, caixa/financeiro e clientes/retenção.
- Nenhuma exportação real é criada na camada pública.

### NEXO IA
- Insights de reposição, recebimentos, margem, clientes e oportunidades locais.
- IA pode preparar rascunhos e navegar para módulos.
- Ação operacional real exige confirmação humana.
- Correção aplicada: “Comparar entregas” agora abre **Delivery**, não Fornecedores.

### Integrações
- UI pública não realiza rede (`connect-src 'none'`).
- Modelo privado planejado: HTTPS + allowlist + timeout + validação + cache.
- ViaCEP como consulta primária, BrasilAPI como fallback e Correios DNE/API autorizada como opção de carga/validação oficial.

### Licença e Suporte
- Licença, suporte e conectividade são estados independentes.
- Falha de internet não equivale a revogação.
- Diagnóstico não expõe chave privada/token.
- Chamados reais dependem do gateway privado HTTPS.

## Base pública local — Avaré/SP

### Metadados
- Município: Avaré/SP
- IBGE: `3504503`
- DDD: `14`
- Faixa de CEP usada como referência: `18700-001` a `18709-999`
- Fontes públicas pesquisadas reportam cerca de `1.524` CEPs.

### Política correta para número do imóvel
O sistema **não infere o número do imóvel a partir do CEP**. O fluxo projetado é:
1. usuário informa CEP;
2. processo principal consulta provider HTTPS;
3. cidade/UF/logradouro/bairro são validados;
4. resultado é armazenado em cache SQLite;
5. usuário informa/confirma número e complemento;
6. faixa de numeração pode detectar inconsistência, mas nunca identificar automaticamente um imóvel.

Isso evita cadastrar endereços falsos e cobre casos em que uma mesma rua troca de CEP conforme a faixa de numeração.

### Seed preparado
Arquivo: `db/avare_public_seed.sql`.

Cria:
- `public_postal_cache`;
- `public_supplier_candidate`;
- `public_locality_meta`.

O seed contém metadados de Avaré, exemplos de faixas postais e **26 candidatos locais**, todos com status de candidato e exigência de homologação comercial.

Distribuição dos 26 candidatos:
- 6 embalagens;
- 6 supermercados;
- 5 carnes/açougues;
- 5 entregas/transportes;
- 4 gás.

### Correções de pesquisa local
- RR EXPRESS foi corrigido para `Rua Acre, 1951 - Centro, Avaré/SP, 18700-260` após validação cruzada.
- UI e SQL foram equalizados para exatamente os mesmos 26 IDs; antes havia divergência entre os dois conjuntos.

## Achados corrigidos na branch
- CSP ausente.
- Busca com `innerHTML`.
- Menu compacto com marcador genérico.
- Command Palette sem controle adequado de foco.
- Risco de módulo abrir área em branco.
- Botão financeiro sem comportamento.
- Falta de aviso ao atingir limite demonstrativo do PDV.
- Filtros sem anúncio de contagem.
- Badges `danger`/`purple` sem estilo.
- Filtro de Pedidos incluindo concluídos.
- Critérios divergentes de margem.
- Código temporário `appendDummy`.
- Validação insuficiente de sangria.
- Divergência UI ↔ SQL na base local.
- Bairro/nome/telefone inconsistentes do candidato RR corrigidos.
- Insight da IA de entrega apontando para módulo incorreto.

## Varredura automatizada
Arquivos principais:
- `tests/ui_static_check.mjs`
- `tests/avare_integrity_check.mjs`
- `.github/workflows/ui-static-check.yml`

O workflow valida sintaxe de `app.js`, `phase2.js`, `avare-data.js`, `phase3.js` e `avare-nav-guard.js`, além de CSP, ausência de APIs DOM inseguras, navegação, regras de negócio demonstrativas, responsividade, base Avaré e consistência UI ↔ SQL.

**Resultado atual:**
- `88/88` verificações estáticas: **PASS**;
- integridade Avaré `26/26` UI ↔ SQL: **PASS**;
- RR EXPRESS corrigido: **PASS**;
- redirecionamento da IA para Delivery: **PASS**;
- sintaxe dos cinco scripts: **PASS**.

## O que ainda não significa “produção pronta”
- Os ~1.524 CEPs não foram copiados em massa para o repositório público. O LAB contém metadados, exemplos e arquitetura de lookup/cache. A carga integral deve vir de fonte autorizada/adequada no ambiente privado.
- O banco comercial SQLite do Electron ainda não recebeu este seed.
- O `app.asar` comercial 9.7 ainda não foi reconstruído com esta UI.
- Persistência/IPC/licença/backup reais continuam pertencendo ao código privado.
- Windows 10/11, DPI e periféricos ainda exigem homologação física.
- Authenticode depende de certificado real da NEXO.
- Fiscal/TEF/PIX/marketplaces dependem de provedores, credenciais e homologação.

## Gates para integração privada
### P0
- `contextIsolation=true`, `nodeIntegration=false`, `sandbox=true` onde compatível, `webSecurity=true`.
- Validar sender/origem em todo IPC privilegiado.
- `contextBridge` deve expor APIs específicas, nunca IPC genérico.
- Bloquear navegação/webview/janelas/permissões por padrão.
- `shell.openExternal` somente com URL HTTPS parseada e allowlist.
- SQLite/WAL com transações; backup via mecanismo seguro e verificação pós-backup.
- Segredos/chaves/tokens fora do pacote cliente.

### P1
- Reduzir IPC síncrono e trabalho de disco no thread principal.
- Separar o código privado por domínio.
- Avaliar protocolo customizado seguro em lugar de `file://`.
- Aplicar Electron Fuses no rebuild oficial quando compatível.
- Authenticode somente com certificado comercial real.

## Regra de promoção
`9.7 FINAL congelada -> 9.8 LAB -> regressão completa -> 9.8 RC -> teste físico Windows -> 9.8 FINAL`.
