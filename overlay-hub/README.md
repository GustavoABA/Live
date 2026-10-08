# Overlay Hub — OBS 800×600

Uma única Browser Source para empilhar overlays externos (StreamElements, alertboxes etc.) e manter os alertas próprios do NihilGuh acima de todos eles.

## URL do overlay

Quando o GitHub Pages da branch `main` estiver ativo:

`https://gustavoaba.github.io/Live/overlay-hub/`

No OBS use **800 × 600**. O fundo da página é transparente.

O StreamElements já está cadastrado em `config.js`.

Para adicionar outro overlay, basta adicionar outro objeto em `config.js` dentro de `overlays`.

---

# Backend de eventos

O fluxo dos alertas próprios é:

`Casterlabs -> Google Apps Script -> Overlay Hub -> animação`

O GitHub Pages é estático, então o Apps Script funciona como uma ponte simples entre o Casterlabs e o Browser Source do OBS.

O arquivo `partner-backend.gs` agora recebe:

- `action=partner` — parceiro da comunidade entrou no chat;
- `action=follow` — novo follow recebido;
- `action=latest` — consulta usada pelo Overlay Hub.

## 1. Publicar o backend

1. Crie um projeto vazio no Google Apps Script.
2. Cole o conteúdo atualizado de `partner-backend.gs`.
3. Em **Project Settings > Script Properties**, crie:
   - `WRITE_TOKEN`: uma senha longa aleatória;
   - `PARTNER_COOLDOWN_MINUTES`: opcional, padrão `180`;
   - `FOLLOW_COOLDOWN_MINUTES`: opcional, padrão `10`.
4. Faça **Deploy > New deployment > Web app**.
5. Execute como você e permita acesso para **Anyone**.
6. Copie a URL que termina em `/exec`.

O `WRITE_TOKEN` não deve ser colocado neste repositório público. Ele fica somente nas Script Properties e nos scripts locais do Casterlabs.

## 2. Ligar o Overlay Hub ao backend

Sem alterar o repositório, use no OBS:

`https://gustavoaba.github.io/Live/overlay-hub/?endpoint=URL_ENCODED_DO_APPS_SCRIPT`

Ou edite o endpoint do bloco `partner`/`events` em `config.js`.

O Overlay Hub consulta `action=latest` aproximadamente uma vez por segundo e ignora eventos antigos ao iniciar, evitando repetir um alerta velho depois de recarregar a fonte.

---

# Follow do TikTok via Casterlabs

O Casterlabs suporta `FOLLOW` em **Chat Bot > Shouts**. Para follow, o objeto JavaScript recebido pelo comando possui `event.follower`.

Use o arquivo:

`casterlabs-tiktok-follow.js`

No Casterlabs configure:

**Chat Bot > Shouts > TikTok > follows > execute**

Depois cole o conteúdo do arquivo e altere somente:

```js
var FOLLOW_WEBHOOK = "SUA_URL_DO_APPS_SCRIPT_EXEC";
var FOLLOW_WRITE_TOKEN = "SEU_WRITE_TOKEN";
```

Quando alguém seguir no TikTok, o script envia:

- username;
- display name;
- avatar, quando o Casterlabs fornecer;
- plataforma `TIKTOK`;
- identificador usado para evitar duplicação.

O Overlay Hub mostra uma animação própria acima das outras alertboxes com:

**NOVO FOLLOW NO TIKTOK**

`@nome_do_usuario`

**BEM-VINDO AO WONDERLAND · OBRIGADO POR SEGUIR**

## Testar a animação sem Casterlabs

Abra:

`https://gustavoaba.github.io/Live/overlay-hub/?follow=Teste&platform=TIKTOK`

Para testar com avatar:

`https://gustavoaba.github.io/Live/overlay-hub/?follow=Teste&platform=TIKTOK&avatar=URL_DA_IMAGEM`

---

# Parceiros da comunidade

O fluxo de parceiros continua funcionando com `casterlabs-command.js`:

**Chat Bot > Commands > Any Platform > sends a message > execute**

O script verifica `username + platform`, mantém o TTS de mensagens e envia o alerta visual apenas quando o usuário estiver na lista `PARCEIROS`.

O backend evita repetir o mesmo parceiro durante 180 minutos por padrão.

Teste local:

`https://gustavoaba.github.io/Live/overlay-hub/?partner=Teste&platform=TWITCH`

Para diagnosticar o backend, adicione `&debug=1` na URL.

## Observação sobre overlays externos

O Overlay Hub empilha documentos externos no mesmo canvas. Um provedor pode bloquear embedding por política própria (`X-Frame-Options` / CSP). Se algum link específico ficar vazio, ele precisará continuar como Browser Source separada no OBS ou usar uma URL do provedor que permita embedding.
