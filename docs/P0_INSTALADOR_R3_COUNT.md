# P0 — Instalador Windows R3 — erro de propriedade `Count`

## Status
**BLOQUEANTE DE HOMOLOGAÇÃO WINDOWS.**

Foi reportado em teste físico do instalador o erro:

> A propriedade 'Count' não foi encontrada neste objeto.

O repositório público 9.8 LAB não contém o instalador comercial/R3 nem deve receber esse código privado. Portanto este documento **não afirma que o defeito foi corrigido**.

## Regra de release
Nenhum R3/RC pode ser marcado como homologado enquanto o fluxo que produziu esse erro não for reproduzido, corrigido e retestado no Windows 10/11.

## Hipótese técnica a verificar no script real
Erros PowerShell desse tipo normalmente aparecem quando código assume que uma expressão sempre retorna coleção/objeto com `.Count`, mas em determinado caminho retorna `$null`, um objeto escalar incompatível ou uma propriedade inexistente.

A correção precisa ser feita no **script real**, não por suposição. Pontos a procurar quando o instalador privado estiver disponível:
- acessos `*.Count` após `Get-ChildItem`, filtros, ZIP entries ou resultados condicionais;
- resultados que podem ser `$null`;
- objetos vindos de `System.IO.Compression.ZipArchive` ou PowerShell com shape diferente do esperado;
- uso de `Set-StrictMode` expondo acesso inválido;
- diferença entre retorno escalar e array.

Padrão defensivo esperado, quando semanticamente correto:
```powershell
$items = @($resultado)
if ($items.Count -eq 0) { ... }
```
Ou validar explicitamente `$null`/tipo antes de acessar a propriedade. Não aplicar esse padrão indiscriminadamente sem entender a condição de negócio.

## Evidência que o diagnóstico deve registrar
Na próxima execução física, o instalador deve produzir log com:
- timestamp;
- etapa/subetapa;
- arquivo/linha da exceção quando disponível;
- tipo do objeto recebido;
- mensagem completa e stack;
- estado do staging;
- hashes do ZIP Electron e app.asar;
- resultado do rollback.

## Critério de aceite
1. Reproduzir o erro no script afetado ou identificar a linha exata pelo log.
2. Criar teste automatizado para retorno vazio, único e múltiplo da expressão envolvida.
3. Corrigir sem remover staging/rollback/hashes.
4. Instalação limpa Windows 10 x64: PASS.
5. Instalação limpa Windows 11 x64: PASS.
6. Atualização sobre versão estável preservando dados/licença: PASS.
7. Falha induzida executa rollback: PASS.
8. Primeiro start exibe MainWindow válida: PASS.
9. Desinstalação preserva dados conforme política: PASS.

Até esses gates, o status correto é **LAB/RC — NÃO HOMOLOGADO**.
