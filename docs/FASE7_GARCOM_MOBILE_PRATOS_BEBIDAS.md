# NEXO ERP PRO 9.8 LAB — Fase 7
## Garçom Mobile + Pratos Executivos + Empresas/Marcas de Bebidas

## 1. Como o garçom enviará o pedido pelo celular

O celular **não instala o ERP completo**. Ele funciona como terminal PWA/web na rede local do estabelecimento.

Fluxo:

`CELULAR → Wi‑Fi local → Serviço NEXO → SQLite privado → Roteador → Cozinha/Bar → ACK/notificação → Celular`

### Acesso
- endereço local planejado: `nexo.local/garcom` ou IP/porta configurado pelo administrador;
- login individual por garçom;
- sessão curta e revogável;
- dispositivo pode ser marcado como confiável pelo administrador;
- garçom não recebe permissões administrativas.

### Envio seguro
1. Garçom abre a mesa/comanda.
2. Seleciona Prato Executivo, Marmita, bebida etc.
3. Define modificadores/adicionais.
4. Confere subtotal.
5. Toca **ENVIAR PEDIDO**.
6. O celular envia uma `idempotency_key` única.
7. O servidor valida sessão, mesa, disponibilidade, preços e versão da comanda.
8. O servidor grava tudo em transação.
9. O roteador cria tickets por setor (`KITCHEN`, `BAR`, `EXPEDITION`).
10. Somente depois do commit o servidor devolve **ACK**.
11. O celular mostra `Pedido enviado` apenas após esse ACK.

### Se o Wi‑Fi cair
- o rascunho pode continuar no aparelho;
- o pedido fica como `QUEUED_LOCAL`/não enviado;
- nunca mostrar `Pedido enviado` sem ACK do servidor;
- ao reconectar, o mesmo `idempotency_key` evita pedido duplicado;
- conflitos de mesa/comanda precisam de resolução explícita.

### Atualização em tempo real
Na integração privada, usar WebSocket/SSE na LAN para eventos:
- pedido aceito;
- item indisponível;
- cozinha/bar em preparo;
- pedido pronto;
- cancelamento;
- cliente solicitou fechamento;
- pagamento concluído.

## 2. Permissões do perfil Garçom

Pode:
- visualizar/abrir mesa;
- criar e complementar comanda;
- adicionar produtos/modificadores;
- enviar pedido;
- acompanhar os próprios pedidos;
- solicitar cancelamento;
- solicitar fechamento.

Não pode:
- alterar preço/custo;
- editar estoque;
- acessar financeiro;
- apagar produtos;
- gerenciar usuários/licença/banco;
- autorizar cancelamento que exija gerente.

## 3. Pratos Executivos

O schema da Fase 7 adiciona `executive_dish` e `executive_dish_component`.

Seeds LAB configuráveis:
- Executivo Bife Acebolado — R$ 29,90;
- Executivo Frango Grelhado — R$ 27,90;
- Executivo Linguiça Acebolada — R$ 27,90;
- Executivo Frango à Parmegiana — R$ 34,90;
- Executivo Bife à Parmegiana — R$ 36,90;
- Executivo Omelete — R$ 24,90.

**Os valores são dados demonstrativos do LAB e devem ser configurados pelo estabelecimento.**

Cada prato pode depois ser associado ao `product_id` comercial e à ficha técnica para baixar ingredientes e calcular CMV/margem.

## 4. Empresas e marcas de bebidas

Separar empresa de marca evita cadastro incorreto.

Empresas de referência verificadas por fonte oficial:
- Sistema Coca-Cola Brasil;
- Ambev S.A.;
- Grupo HEINEKEN Brasil;
- PepsiCo Brasil.

Marcas iniciais:
- Coca-Cola, Fanta, Sprite, Del Valle;
- Brahma, Antarctica, Guaraná Antarctica, Original;
- Heineken, Amstel, Eisenbahn, Itubaína;
- Pepsi, Gatorade, H2OH!, Lipton, Kero Coco.

Esses registros são **referências de fabricante/marca**, não fornecedor comercial homologado. O fornecedor real continua sendo cadastrado/avaliado no módulo Fornecedores.

## 5. Tabelas novas

- `waiter_profile`
- `waiter_device`
- `waiter_session`
- `waiter_order_submission`
- `waiter_notification`
- `waiter_realtime_event`
- `beverage_company`
- `beverage_brand`
- `executive_dish`
- `executive_dish_component`
- `beverage_catalog_reference`

## 6. Segurança da integração privada

- nunca expor SQLite direto ao celular;
- senha somente como hash no servidor;
- token de sessão somente em hash no banco;
- CSRF/origin check quando aplicável;
- limite de tentativas de login;
- rate limit por dispositivo/sessão;
- validação server-side de preço e disponibilidade;
- idempotência obrigatória no envio;
- auditoria de abrir mesa, enviar, alterar, cancelar e solicitar fechamento;
- nenhuma confirmação silenciosa se o servidor estiver indisponível.

## 7. Próximo gate privado

`PWA LAN → autenticação → leitura de mesas/cardápio → rascunho → envio transacional/idempotente → roteador KDS/Bar → eventos em tempo real → cancelamento/fechamento → teste Android/iPhone/tablet → homologação.`
