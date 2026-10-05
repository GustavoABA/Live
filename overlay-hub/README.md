# Overlay Hub — OBS 800×600

Uma única Browser Source para empilhar overlays externos (StreamElements, alertboxes etc.) e manter o alerta próprio do NihilGuh acima de todos eles.

## URL do overlay

Quando o GitHub Pages da branch `main` estiver ativo:

`https://gustavoaba.github.io/Live/overlay-hub/`

No OBS use **800 × 600**. O fundo da página é transparente.

O StreamElements já está cadastrado em `config.js`:

`https://streamelements.com/overlay/68fad2fe811a3e6717f6dc1c/DxMgFn7lnf7LvCPSNRGy71YM3tdigJiu8LHtNAfFjI_WWGLC`

Para adicionar outro overlay, basta adicionar outro objeto em `config.js` dentro de `overlays`.

## Como o alerta de parceiro funciona

O fluxo é:

`chat -> Casterlabs -> Google Apps Script -> Overlay Hub -> animação`

O Casterlabs verifica o `username + platform`. Se estiver na lista `PARCEIROS`, ele faz um GET simples para o backend. O Overlay Hub consulta esse backend e mostra o parceiro no topo com nome, plataforma e avatar.

O backend evita repetir o mesmo parceiro durante 180 minutos por padrão. Esse período pode ser alterado com a Script Property `PARTNER_COOLDOWN_MINUTES`.

## 1. Criar o backend no Google Apps Script

1. Crie um projeto vazio no Google Apps Script.
2. Cole o conteúdo de `partner-backend.gs`.
3. Em **Project Settings > Script Properties**, crie:
   - `WRITE_TOKEN`: uma senha longa aleatória, usada somente pelo Casterlabs.
   - `PARTNER_COOLDOWN_MINUTES`: opcional, por exemplo `180`.
4. Faça **Deploy > New deployment > Web app**.
5. Execute como você e permita acesso para **Anyone**.
6. Copie a URL que termina em `/exec`.

O `WRITE_TOKEN` não deve ser colocado neste repositório público. Ele fica somente nas Script Properties e no comando local do Casterlabs.

## 2. Ligar o Overlay Hub ao backend

Sem alterar nenhum arquivo, coloque o endpoint na URL do Browser Source:

`https://gustavoaba.github.io/Live/overlay-hub/?endpoint=URL_ENCODED_DO_APPS_SCRIPT`

Ou edite `partner.endpoint` em `config.js` e cole a URL `/exec`.

## 3. Configurar o Casterlabs

Abra `casterlabs-command.js` e copie o código para:

**Chat Bot > Commands > Any Platform > sends a message > execute**

Depois altere:

- `PARTNER_WEBHOOK`: URL `/exec` do Apps Script.
- `PARTNER_WRITE_TOKEN`: o mesmo token das Script Properties.
- `PARCEIROS`: lista de `platform + username` dos streamers da comunidade.

Exemplo:

```js
var PARCEIROS = [
  { platform: "TWITCH", username: "fulano" },
  { platform: "KICK", username: "ciclano" }
];
```

O script mantém o TTS para todas as mensagens e só envia o alerta visual quando o usuário estiver em `PARCEIROS`.

## Teste sem Casterlabs

Abra:

`https://gustavoaba.github.io/Live/overlay-hub/?partner=Teste&platform=TWITCH`

Isso força uma animação local e serve para conferir o visual no navegador ou no OBS antes de configurar o backend.

Para diagnosticar o backend, adicione também `&debug=1` na URL.

## Observação sobre overlays externos

O Overlay Hub usa `iframe` para empilhar os links. A maioria dos overlays feitos para Browser Source funciona assim, mas um provedor pode bloquear carregamento em iframe por política própria (`X-Frame-Options` / CSP). Se algum link específico ficar vazio, ele precisará continuar como Browser Source separada no OBS ou usar uma URL do provedor que permita embedding.
