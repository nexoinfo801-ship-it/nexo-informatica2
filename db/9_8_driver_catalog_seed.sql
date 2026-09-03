PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO peripheral_vendor(id,name,official_support_url) VALUES
('ELGIN','Elgin','https://www.elgin.com.br/assistencia-tecnica'),
('BEMATECH','Bematech / Elgin','https://www.elgin.com.br/assistencia-tecnica'),
('EPSON','Epson','https://epson.com.br/peps-drivers-apis-impressoras-nao-fiscais'),
('ZEBRA','Zebra','https://www.zebra.com/us/en/support-downloads.html'),
('ARGOX','Argox','https://www.argox.com/'),
('DATALOGIC','Datalogic','https://www.datalogic.com/'),
('HONEYWELL','Honeywell','https://help.honeywellaidc.com/Content/Resources.htm');

INSERT OR IGNORE INTO peripheral_model(id,vendor_id,model_name,category,connection_modes,driver_mode,printer_languages,notes) VALUES
('ELGIN_I7','ELGIN','i7 / i7 Plus','THERMAL_RECEIPT','USB,SERIAL','REQUIRED','WINDOWS_SPOOLER','Pacote Bz Tech declara Windows/Linux e COM virtual.'),
('ELGIN_I8','ELGIN','i8','THERMAL_RECEIPT','USB,SERIAL,ETHERNET','REQUIRED','WINDOWS_SPOOLER','Pacote Bz Tech inclui firmware e Utility.'),
('ELGIN_I9','ELGIN','i9 Full / i9 Full 2','THERMAL_RECEIPT','USB,SERIAL,ETHERNET','REQUIRED','WINDOWS_SPOOLER','Pacote Bz Tech declara Windows/Linux/ARM.'),
('BEM_MP4200_TH','BEMATECH','MP-4200 TH','THERMAL_RECEIPT','USB,SERIAL,ETHERNET','REQUIRED','WINDOWS_SPOOLER','Driver Windows/Linux e COM virtual conforme Bz Tech.'),
('BEM_MP4200_ADV','BEMATECH','MP-4200 TH ADV','THERMAL_RECEIPT','USB,SERIAL,ETHERNET','REQUIRED','WINDOWS_SPOOLER','Driver Spooler v5.0.04 declarado pela fonte.'),
('BEM_MP4200_HS','BEMATECH','MP-4200 HS','THERMAL_RECEIPT','USB,SERIAL,ETHERNET','REQUIRED','WINDOWS_SPOOLER','Pacote Bz Tech inclui driver Windows e firmware.'),
('EPSON_T20X','EPSON','TM-T20X','THERMAL_RECEIPT','USB,ETHERNET,SERIAL','REQUIRED','WINDOWS_SPOOLER','Epson APD 6 e TMUSB disponíveis em suporte oficial.'),
('EPSON_T20X2','EPSON','TM-T20X-II','THERMAL_RECEIPT','USB,ETHERNET,SERIAL','REQUIRED','WINDOWS_SPOOLER','Suporte oficial Epson.'),
('ELGIN_L42PRO','ELGIN','L42 Pro Full','LABEL_PRINTER','USB,ETHERNET,SERIAL','REQUIRED','EPL,ZPL,PPLA,PPLB','203 dpi; impressão térmica direta/transferência.'),
('ZEBRA_ZD220','ZEBRA','ZD220','LABEL_PRINTER','USB','REQUIRED','ZPL,EPL','Suporte oficial da série ZD200.'),
('ZEBRA_ZD230','ZEBRA','ZD230','LABEL_PRINTER','USB,ETHERNET','REQUIRED','ZPL,EPL','Suporte oficial da série ZD200.'),
('ZEBRA_ZD421','ZEBRA','ZD421','LABEL_PRINTER','USB,ETHERNET,BLUETOOTH','REQUIRED','ZPL,EPL','Zebra recomenda Windows Printer Driver v10.'),
('ARGOX_OS214PRO','ARGOX','OS-214 Pro','LABEL_PRINTER','USB,SERIAL','REQUIRED','PPLA,PPLB,ZPL','Driver Windows e Linux oficial.'),
('ARGOX_OS214NU','ARGOX','OS-214NU','LABEL_PRINTER','USB,ETHERNET,SERIAL','REQUIRED','PPLA,PPLB,ZPL','Driver Windows e Linux oficial.'),
('ARGOX_OS214DPRO','ARGOX','OS-214D Pro','LABEL_PRINTER','USB','REQUIRED','PPLA,PPLB,ZPL','Driver Windows e Linux oficial.'),
('ELGIN_FLASH2','ELGIN','Flash II','BARCODE_SCANNER','USB','HID_NO_DRIVER',NULL,'USB HID para leitura básica; driver extra só se usar modo serial/SDK específico.'),
('ZEBRA_DS2208','ZEBRA','DS2208','BARCODE_SCANNER','USB','OPTIONAL',NULL,'HID funciona sem driver; USB CDC exige driver apropriado.'),
('DATALOGIC_QS2500','DATALOGIC','QuickScan 2500','BARCODE_SCANNER','USB','OPTIONAL',NULL,'USB-COM disponível para Windows 10/11.'),
('DATALOGIC_GRY4200','DATALOGIC','Gryphon 4200','BARCODE_SCANNER','USB,BLUETOOTH','OPTIONAL',NULL,'USB-COM disponível para Windows 10/11.'),
('DATALOGIC_GRY4600','DATALOGIC','Gryphon 4600','BARCODE_SCANNER','USB,BLUETOOTH','OPTIONAL',NULL,'USB-COM disponível para Windows 10/11.');

INSERT OR IGNORE INTO driver_source(id,source_name,source_type,page_url,trust_level,last_verified_date,notes) VALUES
('SRC_BZ_ELGIN','Bz Tech — Driver Elgin i7/i8/i9','RESELLER','https://www.bztech.com.br/downloads/driver-elgin-i7-i8-e-i9-windows-e-linux',2,'2026-09-03','Página atualizada em 20/05/2026 segundo a própria fonte.'),
('SRC_BZ_MP4200','Bz Tech — Driver Bematech MP-4200','RESELLER','https://www.bztech.com.br/downloads/driver-bematech-mp-4200',2,'2026-09-03','Página atualizada em 29/07/2026 segundo a própria fonte.'),
('SRC_EPSON_T20X','Epson Brasil — TM-T20X','OFFICIAL','https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-de-recibos/Epson-TM-T20X/s/SPT_C31CH26031?review-filter=Windows+11',3,'2026-09-03','Driver v6.07R1 publicado em 26/08/2025.'),
('SRC_EPSON_T20X2','Epson Brasil — TM-T20X-II','OFFICIAL','https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-de-recibos/Epson-TM-T20X-II/s/SPT_C31CL45011',3,'2026-09-03','Suporte oficial.'),
('SRC_ELGIN_L42','Elgin — L42 Pro Full','OFFICIAL','https://www.elgin.com.br/Produtos/automacao/impressoras-de-etiquetas/L42PROFULL',3,'2026-09-03','Página oficial confirma EPL/ZPL/PPLA/PPLB.'),
('SRC_ZEBRA_ZD200','Zebra — ZD220/ZD230 Support','OFFICIAL','https://www.zebra.com/la/es/support-downloads/printers/desktop/ZD200d.html',3,'2026-09-03','Página oficial da série ZD200.'),
('SRC_ZEBRA_ZD421','Zebra — ZD421 Support','OFFICIAL','https://www.zebra.com/us/en/support-downloads/printers/desktop/zd421.html',3,'2026-09-03','Recomenda Windows Printer Driver v10.'),
('SRC_ZEBRA_SCANNERS','Zebra — Barcode Scanners Support','OFFICIAL','https://www.zebra.com/us/en/support-downloads/scanners.html',3,'2026-09-03','Inclui 123Scan, SDK e drivers por modelo.'),
('SRC_ARGOX_OS214PRO','Argox — OS-214 Pro','OFFICIAL','https://www.argox.com/products-detail/os-214_pro/',3,'2026-09-03','Driver Windows 12.5.0 e Linux 1.10.0 listados.'),
('SRC_ARGOX_OS214NU','Argox — OS-214NU','OFFICIAL','https://www.argox.com/products-detail/os-214nu/',3,'2026-09-03','Driver Windows/Linux listados.'),
('SRC_ARGOX_OS214DPRO','Argox — OS-214D Pro','OFFICIAL','https://www.argox.com/products-detail/os-214d_pro/',3,'2026-09-03','Driver Windows 12.5.0 e Linux 1.10.0 listados.'),
('SRC_DATALOGIC_QS2500','Datalogic — QuickScan 2500','OFFICIAL','https://cdn.datalogic.com/eng/einzelhandel-industrielle-automation-gesundheitswesen-gs1-digital-link/handheld-scanners/quickscan-2500-series-pd-898.html',3,'2026-09-03','USB-COM 7.1.5 para Windows 10/11.'),
('SRC_DATALOGIC_GRY4200','Datalogic — Gryphon 4200','OFFICIAL','https://cdn.datalogic.com/eng/retail-trasporti-e-logistica-sanita-altre-applicazioni/handheld-scanners/gryphon-4200-series-pd-878.html',3,'2026-09-03','USB-COM 7.1.5 para Windows 10/11.'),
('SRC_DATALOGIC_GRY4600','Datalogic — Gryphon 4600','OFFICIAL','https://cdn.datalogic.com/eng/retail-manufacturing-transportation-logistics-healthcare-gs1-digital-link-other-applications/handheld-scanners/gryphon-4600-series-pd-1147.html',3,'2026-09-03','USB-COM 7.1.5 para Windows 10/11.');

INSERT OR IGNORE INTO driver_package(id,source_id,package_name,version,os_family,architecture,package_kind,signed_status,release_date,catalog_status,notes) VALUES
('PKG_ELGIN_MULTI','SRC_BZ_ELGIN','Elgin i7/i8/i9 Driver Pack',NULL,'MULTI','MULTI','PRINTER_DRIVER','UNKNOWN',NULL,'CANDIDATE','Não armazenar executável no ERP; validar hash/assinatura no download real.'),
('PKG_ELGIN_VCOM','SRC_BZ_ELGIN','Elgin Virtual COM USB/Serial',NULL,'WINDOWS','X86_X64','VIRTUAL_COM','UNKNOWN',NULL,'CANDIDATE','Fonte declara 32/64 bits.'),
('PKG_MP4200_SPOOLER','SRC_BZ_MP4200','MP-4200 TH/ADV Windows Spooler','5.0.04','WINDOWS','X86_X64','PRINTER_DRIVER','UNKNOWN',NULL,'CANDIDATE','Versão declarada pela Bz Tech.'),
('PKG_MP4200_LINUX','SRC_BZ_MP4200','MP-4200 TH/ADV Linux',NULL,'LINUX','AMD64_I386','PRINTER_DRIVER','UNKNOWN',NULL,'CANDIDATE','Fonte cita amd64, i386, OpenSuseLeap e CUPS v1.'),
('PKG_MP4200_HS','SRC_BZ_MP4200','MP-4200 HS Driver Windows',NULL,'WINDOWS','X86_X64','PRINTER_DRIVER','UNKNOWN',NULL,'CANDIDATE','Validar pacote e assinatura antes de uso comercial.'),
('PKG_EPSON_APD607','SRC_EPSON_T20X','Epson TM-T20X Advanced Printer Driver','6.07R1','WINDOWS','X86_X64','PRINTER_DRIVER','CLAIMED','2025-08-26','VERIFIED','Fonte oficial Epson; compatível com Windows 11 e versões anteriores listadas.'),
('PKG_EPSON_TMUSB800D','SRC_EPSON_T20X','Epson TMUSB','800d','WINDOWS','X86_X64','UTILITY','CLAIMED','2024-08-02','VERIFIED','Driver de dispositivo TMUSB.'),
('PKG_ZEBRA_V10','SRC_ZEBRA_ZD421','Zebra Windows Printer Driver','10','WINDOWS','X64','PRINTER_DRIVER','CLAIMED',NULL,'VERIFIED','Zebra recomenda driver v10 para ZD421.'),
('PKG_ZEBRA_CDC_X64','SRC_ZEBRA_SCANNERS','Zebra CDC ACM Driver x64','2.15.0004','WINDOWS','X64','SCANNER_DRIVER','CLAIMED',NULL,'VERIFIED','Necessário para USB CDC em scanners compatíveis como DS2208.'),
('PKG_ARGOX_WIN125','SRC_ARGOX_OS214PRO','Argox Windows Printer Driver','12.5.0','WINDOWS','X64','PRINTER_DRIVER','CLAIMED',NULL,'VERIFIED','Página oficial lista Windows 10/11.'),
('PKG_ARGOX_LINUX110','SRC_ARGOX_OS214PRO','Argox Linux Printer Driver','1.10.0','LINUX','X64','PRINTER_DRIVER','CLAIMED',NULL,'VERIFIED','CUPS 2.1.X ou superior.'),
('PKG_DATALOGIC_USBCOM715','SRC_DATALOGIC_QS2500','Datalogic USB-COM Driver','7.1.5','WINDOWS','X86_X64','SCANNER_DRIVER','VERIFIED','2026-06-17','VERIFIED','Fonte oficial declara assinatura por Microsoft attestation e Windows 10/11.');

INSERT OR IGNORE INTO driver_model_compatibility(driver_package_id,model_id,support_level,notes) VALUES
('PKG_ELGIN_MULTI','ELGIN_I7','DECLARED',NULL),('PKG_ELGIN_MULTI','ELGIN_I8','DECLARED',NULL),('PKG_ELGIN_MULTI','ELGIN_I9','DECLARED',NULL),
('PKG_ELGIN_VCOM','ELGIN_I7','DECLARED',NULL),('PKG_ELGIN_VCOM','ELGIN_I8','DECLARED',NULL),('PKG_ELGIN_VCOM','ELGIN_I9','DECLARED',NULL),
('PKG_MP4200_SPOOLER','BEM_MP4200_TH','DECLARED',NULL),('PKG_MP4200_SPOOLER','BEM_MP4200_ADV','DECLARED',NULL),('PKG_MP4200_HS','BEM_MP4200_HS','DECLARED',NULL),
('PKG_MP4200_LINUX','BEM_MP4200_TH','DECLARED',NULL),('PKG_MP4200_LINUX','BEM_MP4200_ADV','DECLARED',NULL),
('PKG_EPSON_APD607','EPSON_T20X','DOCUMENTED',NULL),('PKG_ZEBRA_V10','ZEBRA_ZD421','DOCUMENTED',NULL),
('PKG_ZEBRA_CDC_X64','ZEBRA_DS2208','DOCUMENTED','Somente quando scanner operar como USB CDC.'),
('PKG_ARGOX_WIN125','ARGOX_OS214PRO','DOCUMENTED',NULL),('PKG_ARGOX_WIN125','ARGOX_OS214DPRO','DOCUMENTED',NULL),
('PKG_ARGOX_LINUX110','ARGOX_OS214PRO','DOCUMENTED',NULL),('PKG_ARGOX_LINUX110','ARGOX_OS214DPRO','DOCUMENTED',NULL),
('PKG_DATALOGIC_USBCOM715','DATALOGIC_QS2500','DOCUMENTED',NULL),('PKG_DATALOGIC_USBCOM715','DATALOGIC_GRY4200','DOCUMENTED',NULL),('PKG_DATALOGIC_USBCOM715','DATALOGIC_GRY4600','DOCUMENTED',NULL);

INSERT OR IGNORE INTO product_label_template(id,name,width_mm,height_mm,symbology,printer_language,data_fields) VALUES
('LBL_PRICE_40X25','Preço 40x25 mm',40,25,'EAN13','WINDOWS_SPOOLER','nome,preco,codigo_barras'),
('LBL_PRODUCT_50X30','Produto 50x30 mm',50,30,'CODE128','ZPL','nome,sku,preco,codigo_barras'),
('LBL_SHELF_60X40','Gôndola 60x40 mm',60,40,'EAN13','ZPL','nome,preco_unitario,unidade,codigo_barras'),
('LBL_QR_50X50','QR Produto 50x50 mm',50,50,'QR','ZPL','nome,sku,qr_payload');
