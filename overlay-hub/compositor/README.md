# NihilGuh Overlay Compositor

Este compositor existe para juntar paginas de alertbox que nao funcionam corretamente quando carregadas dentro de `iframe`.

## Como funciona

Cada URL de `overlays.json` abre em uma pagina Chromium independente pelo Playwright. Portanto, para LivePix, StreamElements e outros provedores, cada widget continua sendo uma pagina principal completa. O compositor captura essas paginas com fundo transparente, empilha pelo `zIndex` e envia o resultado para uma unica Browser Source.

## Iniciar

No Windows, execute:

```powershell
./start-compositor.ps1
```

Na primeira execucao o script instala as dependencias e o Chromium do Playwright.

Deixe a janela do PowerShell aberta durante a live.

## Browser Source

A saida local direta e:

```text
http://127.0.0.1:8791/
```

O hub publico tambem tenta conectar automaticamente ao compositor local:

```text
https://gustavoaba.github.io/Live/overlay-hub/
```

Se o CEF/Chromium do OBS bloquear WebSocket local a partir do GitHub Pages, use a URL local acima. O conteudo e o mesmo.

## Adicionar alertboxes

Edite apenas `overlays.json`:

```json
{
  "id": "meu-alertbox",
  "label": "Meu Alertbox",
  "url": "https://exemplo.com/meu-widget",
  "enabled": true,
  "zIndex": 50
}
```

O arquivo e observado em tempo real. Ao salvar `overlays.json`, as paginas sao recriadas automaticamente sem precisar reiniciar o processo.

## Canvas e FPS

No topo de `overlays.json`:

```json
"canvas": {
  "width": 800,
  "height": 600,
  "fps": 15
}
```

Aumentar o FPS deixa animacoes mais fluidas, mas aumenta o uso de CPU. Para alertas, 15 a 20 FPS costuma ser um bom equilibrio.

## Audio

O compositor intercepta reproducoes feitas por elementos HTML `<audio>` e `<video>` dentro das paginas e replica o som na Browser Source unica. Isso permite manter o audio no mixer da fonte do hub em vez de depender do audio do navegador externo.
