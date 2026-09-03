# NEXO ERP PRO 9.8 LAB — UI/UX pública

Este repositório contém **somente a camada visual, componentes de interface e documentação técnica não sensível** do laboratório NEXO ERP PRO 9.8.

## Regras
- A versão comercial NEXO ERP PRO 9.7 permanece congelada.
- Este repositório NÃO contém chaves privadas, tokens, servidor de licenciamento, segredos de integrações, dados de clientes ou lógica privada do revendedor.
- O código Electron/ASAR comercial continua fora deste repositório.
- O Visual Pro 360 será portado para a aplicação privada somente após testes no LAB.

## Status atual do 9.8 LAB
Implementado na branch `9.8-lab-hardening`:
- Dashboard executivo.
- PDV demonstrativo com busca, carrinho, quantidades, pagamentos e finalização segura sem persistência.
- Recebimentos 360 com bruto, líquido, estágio e agenda de liquidação.
- Financeiro com aging, fluxo projetado e compromissos.
- Estoque com físico, reservado, disponível e em trânsito.
- Busca global `Ctrl+K` e navegação por hash.
- CSP restritiva, event delegation e acessibilidade reforçada.
- Layout responsivo Visual Pro 360.
- GitHub Actions com verificação de sintaxe e varredura estática.

Última varredura validada: **47/47 verificações PASS** + `node --check ui/app.js` PASS.

## Próximos módulos do LAB
- Pedidos / Delivery.
- Produtos / Compras / Fornecedores.
- Caixa.
- Clientes / CRM.
- Relatórios.
- NEXO IA.
- Integrações.
- Licença e Suporte.

## Identidade visual
- Azul principal: `#0A84FF`
- Azul secundário: `#0066CC`
- Azul profundo: `#0B1D3A`
- Fundo: `#070B12`
- Superfícies: `#0E1623` / `#121D2C`
- Sucesso: `#22C55E`
- Atenção: `#F59E0B`
- Erro: `#EF4444`
- IA/Especial: `#7C3AED`

A referência visual oficial é o dashboard escuro aprovado no projeto NEXO ERP PRO 9.8 LAB.
