# NihilGuh · animações ambientais (OBS)
Este sistema pertence às 10 cenas normais de NihilGuh e às 10 cenas Halloween em `*/halooween/`.
As pastas `*/Adam/` e `assets/adam/` são de outro streamer e NÃO são modificadas.

## Temas
**Normal — Midnight Cat Club:** gatos escuros correndo em ambas as direções, poeira estelar, brilhos lilás/rosa/dourado, aurora e entrada cinematográfica suave; preserva fanarts, layout, cronômetros e piscada do personagem.

**Halloween — Green Haunted Cat Club:** teias e aranhas em movimento, gatos fantasmas flutuando, gatos correndo em ambos os sentidos, chamas/névoas esmeralda e elementos roxos. Abóboras laranja e elementos anteriores permanecem, mas os acentos se tornam verde sobrenatural.

## Arquivos
- `shared/ambient.css`: desenho, temas, movimentos de personagens SVG e fallback 100% CSS
- `shared/ambient.js`: produção de sprites SVG, trajetórias, seeded pseudo-random e GSAP timelines

Os SVGs são vetoriais e independem de uploads de imagens ou links externos.
As dez cenas Halloween e as dez normais carregam os mesmos arquivos compartilhados, selecionando o tema pela classe do `body`.

## Parâmetros de URL
- `?motion=0`: remove os efeitos de movimento (também respeita `prefers-reduced-motion`)
- `?fx=0`: desliga só o sistema de animações novo
- `?intensity=low`: menos elementos para melhorar desempenho do OBS
- `?intensity=high`: mais sprites, se o PC aguentar
- `?guide=1`: guias originais do OBS para alinhamento
- `?minutes=10`: contagem regressiva original (cena 00)
- `?fx=low`: sinônimo de densidade baixa

## Compatibilidade e HyperFrames
HyperFrames é principalmente um renderizador de vídeo a partir de HTML, não um motor de reprodução de fontes OBS.
Por isso, a versão ao vivo usa HTML/CSS/JS no Browser Source, além de GSAP quando disponível.
Os novos efeitos seguem padrões de animação GSAP: tempos explícitos, seed determinístico e registro de timelines em `window.__timelines` para possíveis composições HyperFrames futuras. **Não há pipeline HyperFrames instalado nesta pasta e não se promete exportação determinística para MP4 sem adaptação.**

## Cuidados
- CSS animado é a alternativa se GSAP não carregar.
- Toda a camada é `pointer-events:none` para não bloquear OBS/Browser Source.
- O sistema pausa animações CSS ao ocultar a fonte e respeita a preferência do sistema por movimento reduzido.
- O gameplay, reacts e colabs têm densidade de efeitos reduzida para priorizar o conteúdo.
- Os gatos que vão para a direita olham para a direita; os que vão para a esquerda são espelhados para olhar para a esquerda.
