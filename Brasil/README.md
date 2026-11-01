# NIHILGUH · VAI BRASIL — 15/11/2026
Tema especial da Proclamação da República, baseado no verde, amarelo, azul e branco. Independência do Brasil: 7 de setembro, data distinta.
As bandeiras SVG são artes estilizadas comemorativas, não modelos oficiais de reprodução.
## URLs
- `0-iniciando/Brasil/`
- `1-entrada/Brasil/`
- `2-chat/Brasil/`
- `3-gameplay/Brasil/`
- `4-reacts/Brasil/`
- `5-intermissao/Brasil/`
- `6-colabs/Brasil/`
- `7-ja-volto/Brasil/`
- `8-final/Brasil/`
- `9-emergencia/Brasil/`
- Painel `Brasil/`
## Conteúdo
Bandeiras vetoriais ondulantes, estrelas, faixas, confetes, figuras andando com bandeirinhas. A cena 00 intercala VAI BRASIL! e fanarts sucessivas: slogan, uma arte, slogan, outra arte.
## Parâmetros
`?guide=1`, `?motion=0`, `?fx=0`, `?intensity=low`, `?intensity=high`, `?minutes=10`, `?slideSeconds=5` (3–30 segundos).
## Compartilhados
`shared/brasil.css`, `shared/brasil.js`, `shared/brasil-fanarts.js`.
As 10 cenas originais, as versões Halloween e Adam são preservadas. A data aparece como texto; a seleção do tema no OBS é manual, não agendada.

## v2 — Contrato de camadas e timeline (01/11/2026)
- Os elementos do Brasil ocupam uma **camada decorativa de nível 2**, inferior ao personagem (4), workspace (8), hero (10), galeria e emergência (12), HUD/cabeçalho/rodapé (16).
- GSAP controla um **relógio mestre de 24 segundos** (quando carregado); `requestAnimationFrame` mantém a mesma lógica caso o GSAP falhe.
- Bandeiras e figurantes compartilham a mesma fase global, com variações sutis determinísticas. Efeitos CSS usam ciclos compatíveis.
- Pessoas com bandeiras confinadas a uma faixa baixa do rodapé, sempre atrás de interfaces OBS.
- Cenas com chat/vídeo têm máscaras nas partículas; fontes funcionais não são interceptadas.
- Galeria: `shared/brasil-fanarts.js` assina `window.BrasilMotionClock`. Nunca mostra dois slides ao mesmo tempo; as transições são calculadas a partir do tempo compartilhado.
- A informação 15/11 já existe no cabeçalho e na arte. O segundo distintivo `.br-date` fica oculto para evitar cruzamento de textos.
- `?motion=0` mantém fanart estática e interrompe movimento; `?fx=0` desativa a decoração. Todas as demais versões continuam sem alterações.
- Não se trata de um runtime HyperFrames instalado no OBS: GSAP/HTML/CSS rodam diretamente na fonte Navegador, em uma composição com relógio comum que também pode ser portada para renderização HyperFrames.
