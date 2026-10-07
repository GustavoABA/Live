# NihilGuh · Midnight Cat Club

Identidade oficial da live em HTML/CSS/JS, preparada para Browser Source do OBS e GitHub Pages. O sistema usa uma única URL por cena, animações leves e layouts adaptativos para **1920×1080** e **1080×1920**.

## Cenas

| Rota | Uso |
| --- | --- |
| `0-iniciando/` | Recepção da live, sem VTuber |
| `1-entrada/` | VTuber central + chat no canto esquerdo superior |
| `2-chat/` | 2–3 VTubers + chat no canto esquerdo superior |
| `3-gameplay/` | Background limpo |
| `4-reacts/` | Conteúdo à esquerda + chat e VTuber à direita |
| `5-intermissao/` | Pausa com cronômetro |
| `6-colabs/` | Quatro convidados + chat |
| `7-ja-volto/` | Pausa rápida com cronômetro |
| `8-final/` | Encerramento |
| `9-emergencia/` | Problemas técnicos |

## Parâmetros úteis

- `?guide=1` mostra os nomes das áreas para facilitar o alinhamento no OBS.
- `?motion=0` congela as animações.
- `?minutes=10` define a duração da contagem da cena `0-iniciando`.

Use a URL sem `guide=1` durante a transmissão. Os painéis e molduras continuam visíveis, mas os rótulos de orientação desaparecem.

## Alertas

`overlay-hub/` continua sendo a Browser Source única dos alertas do Casterlabs. A pasta foi mantida fora desta refatoração e deve ficar acima da cena atual na ordem de fontes do OBS.

## Estrutura visual

- `assets/nihilguh-night.png`: background principal, seguro para corte horizontal e vertical.
- `assets/nihilguh-character-open.png`: recorte transparente do personagem.
- `assets/nihilguh-character-blink.png`: quadro alternativo da piscada.
- `shared/scene.css`: identidade, layouts e responsividade.
- `shared/scene.js`: timers, parâmetros de URL, pausa quando a fonte está oculta e piscada orgânica.

Abra `index.html` para acessar o painel de cenas e copiar as URLs limpas.
