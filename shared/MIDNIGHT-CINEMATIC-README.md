# NihilGuh — Midnight Cat Club · versão cinematográfica
Implementação exclusivamente para as dez cenas **normais**. O Halloween em `*/halooween/` e o pacote do Adam permanecem iguais.

## Identidade visual
- Paleta original de roxo, lavanda, rosa e dourado; luz de luar, constelações vetoriais, anéis mágicos, trilhas de patinhas, nébulas, cometas, borboletas noturnas com asas animadas, flutuação de partículas e pétalas nas bordas.
- Gatos redesenhados em SVG com patas alternadas, rabinho e orelha animada, coleira e olhos iluminados.
- Tamanho normal dos gatos: **48–76 px**, posicionados próximos do rodapé.
- **No máximo 2 gatos por cena**, por padrão: 2 em cenas de foco e 1 em gameplay/reacts/colabs. Em modo econômico: 1.
- Gatos olhando na direção do movimento. SVG padrão olha à direita e é espelhado na animação que vai à esquerda.
- Efeitos mais discretos para gameplay/reacts/colabs, preservando espaço para a transmissão.

## Arquivos
- `shared/midnight.css`: estilos de efeitos exclusivos da versão normal; é carregado depois de `shared/ambient.css`.
- `shared/midnight.js`: motor de gatos detalhados, meteoros, anéis, constelações, borboletas, estrelas, marcas de patas; carrega no lugar de `shared/ambient.js` somente nas cenas normais.
- O Halloween continua usando `shared/ambient.css` + `shared/ambient.js`, inalterados.

## Parâmetros do OBS
- `?cats=1` ou `?cats=2`: ajusta o número de gatinhos (máximo 2).
- `?intensity=low` (ou `?fx=low`): reduz partículas e mantém 1 gato; bom para PCs lentos.
- `?intensity=high`: aumenta **efeitos luminosos**, nunca o número de gatos além de 2.
- `?fx=0`: desativa apenas esta camada de efeitos.
- `?motion=0`: pausa todos os movimentos, como na versão existente.
- `?guide=1`: preserva as guias OBS originais.

## Execução e HyperFrames
O HyperFrames é um renderizador determinístico de HTML para vídeo, não o mecanismo de execução ao vivo do OBS. O novo overlay é HTML/CSS/SVG com GSAP em tempo real, seguindo o padrão de timelines usado em composições HyperFrames; mantém fallback CSS. Não precisa importar um pacote HyperFrames para rodar no OBS.
