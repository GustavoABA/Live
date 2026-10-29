# Adam · Blue Moon Club

Pacote independente de dez cenas para OBS, baseado na biblioteca existente, sem substituir nenhuma cena da NihilGuh.

## Entradas

- `Adam/`: painel das dez cenas.
- `Adam/0-iniciando/` até `Adam/9-emergencia/`: Browser Sources (1920×1080 ou 1080×1920).
- `Adam/theme.css`: paleta azul, preto e branco; fundo noturno em CSS.
- `Adam/assets/adam.webp`: versão WebP de alta qualidade (opcional, quando adicionada; substitui automaticamente a prévia).\n- `Adam/assets/adam-base64.txt`: prévia AVIF transparente e embutida, pronta para exibição mesmo sem upload binário.\n- `Adam/character.js`: prioriza o WebP e, caso ele não exista, carrega a prévia AVIF.

## Parâmetros

- `?guide=1`: guias de montagem de chat e VTuber.
- `?motion=0`: remove as animações.
- `?minutes=10`: contagem inicial da cena Iniciando.

O acervo de fanarts, temporizadores e animações utiliza os módulos compartilhados do repositório. O sistema de alertas em `overlay-hub/` continua separado, para uso como fonte acima das cenas. 

A imagem do personagem é estática nesta versão (não existe outro quadro de piscada fornecido); o efeito de flutuação não depende de sprites adicionais.

O personagem da referência foi recortado. Para máxima nitidez nas cenas, coloque o arquivo WebP transparente em `Adam/assets/adam.webp`; as páginas passam a usá-lo automaticamente.
