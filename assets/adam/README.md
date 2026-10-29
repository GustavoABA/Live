# ADAM // GOATFIRE — overlays OBS
Pacote dedicado a outro streamer (Adam), completamente separado da identidade da NihilGuh.

## URLs e estrutura
Painel: `/Live/adam.html`.
Cenas: `/Live/0-iniciando/Adam/`, `/Live/1-entrada/Adam/`, `/Live/2-chat/Adam/`, `/Live/3-gameplay/Adam/`, `/Live/4-reacts/Adam/`, `/Live/5-intermissao/Adam/`, `/Live/6-colabs/Adam/`, `/Live/7-ja-volto/Adam/`, `/Live/8-final/Adam/`, `/Live/9-emergencia/Adam/`.

## Identidade
- Tipografia industrial, azul/azul elétrico, chamas estilizadas e cabritos em SVG com animação própria.
- Cenas 1920x1080 e 1080x1920; tempo de contagem e cronômetro controlados por JS.
- Arte do personagem Adam carregada pela pasta `assets/adam/`, sem utilizar as imagens da NihilGuh.
- O personagem original enviado é estático. Não foi inventado quadro de piscada.
- Não há galeria de fanarts nem referências às imagens, textos e marcas do outro streamer dentro das cenas.
- Os módulos originais `shared/scene.css`, `shared/scene.js` e `overlay-hub/` não são usados nem modificados.

## Arquivos do Adam
- `assets/adam/overlay.css`: tema visual completo
- `assets/adam/overlay.js`: cenas, cronômetros, cabritinhos SVG, efeitos e carregamento do avatar
- `assets/adam/adam-base64.txt`: prévia transparente compacta enviada anteriormente
- Opcional: adicione `assets/adam/adam.webp` com resolução maior. Ele será priorizado sobre a prévia compacta.

## Parâmetros
- `?guide=1`: exibe marcações das áreas reservadas ao OBS.
- `?motion=0`: paralisa animações, inclusive cabritinhos.
- `?transparent=1`: remove o fundo do tema para usar as molduras como camada superior no OBS.
- `?minutes=10`: duração da contagem regressiva na cena 00 (padrão 10 minutos, até 120).

## Configuração OBS
Crie uma fonte Navegador para cada URL que quiser usar. Para horizontal, use 1920x1080; para vertical, use 1080x1920. Conteúdo de jogo, chat e VTuber são fontes separadas: o tema fornece áreas e molduras, não conecta automaticamente widgets ou contas de terceiros.
