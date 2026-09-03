# NEXO ERP PRO 9.8 LAB — Fase 6: Central de Drivers & Periféricos

## Objetivo
Criar um catálogo técnico dentro do NEXO para impressoras de cupom, impressoras de etiquetas e leitores de código de barras, com recomendação assistida pela NEXO IA.

## Regra principal
O ERP não embute executáveis de terceiros no pacote público. O banco guarda modelo, sistema operacional, arquitetura, fonte, versão, tipo de pacote, status de assinatura, SHA-256 quando conhecido e nível de homologação.

## Fontes analisadas
- Bz Tech: Elgin i7/i7 Plus/i8/i9 Full/i9 Full 2 — Windows/Linux, COM virtual, firmware, Utility e biblioteca E1.
- Bz Tech: Bematech MP-4200 TH/ADV/HS — Windows/Linux, Spooler 5.0.04 para TH/ADV, COM virtual, firmware e biblioteca E1.
- Epson Brasil: TM-T20X — APD 6.07R1 para Windows 11/10 e TMUSB 800d.
- Elgin: L42 Pro Full — EPL, ZPL, PPLA e PPLB; impressão térmica de etiquetas.
- Zebra: ZD220/ZD230/ZD421 e suporte de scanners; ZD421 recomenda Windows Printer Driver v10.
- Argox: OS-214 Pro/NU/D Pro — drivers Windows e Linux.
- Datalogic: QuickScan 2500 e Gryphon 4200/4600 — USB-COM 7.1.5 para Windows 10/11.

## Leitores de código de barras
Leitor em modo USB-HID deve ser tratado como teclado e normalmente não precisa de driver adicional. Driver específico só deve ser recomendado quando o equipamento estiver em CDC/Virtual COM, OPOS/JPOS ou SDK proprietário.

## Etiquetas de produto
O LAB inclui contratos e UI para:
- preço 40x25 mm / EAN-13;
- produto 50x30 mm / Code 128;
- gôndola 60x40 mm / EAN-13;
- QR produto 50x50 mm.

Linguagens previstas: Windows Spooler, ZPL, EPL, PPLA e PPLB.

## NEXO IA — Driver Care
A IA pode:
1. identificar modelo, SO, arquitetura e modo USB;
2. dizer quando nenhum driver é necessário;
3. recomendar pacote do catálogo;
4. bloquear recomendação incompatível;
5. exigir fonte autorizada, assinatura e SHA-256;
6. orientar instalação, porta, spooler e calibração;
7. solicitar teste de impressão/leitura;
8. registrar aprovação, resultado e rollback em auditoria.

## Segurança obrigatória
- Preferir fonte oficial; reseller fica como candidato até validação.
- HTTPS obrigatório para download remoto.
- Não instalar com privilégio administrativo sem aprovação humana.
- Validar assinatura Authenticode/catálogo quando aplicável.
- Calcular SHA-256 do arquivo realmente baixado.
- Nunca confiar apenas no nome do arquivo ou no nome do modelo.
- Não chamar pacote de HOMOLOGATED sem teste físico no Windows/hardware real.
- Manter rollback/ponto de restauração para alteração de driver em produção.

## Status do LAB
A UI é demonstrativa e não baixa ou executa drivers. A camada privada Electron ainda deve implementar enumeração de dispositivos, download controlado, validação criptográfica, instalação privilegiada com consentimento e testes físicos.
