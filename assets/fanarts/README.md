# Fanarts da comunidade ♡

Todas as imagens nesta pasta são exibidas automaticamente no carrossel de `0-iniciando/`, em ordem alfabética.

## Como adicionar fanarts

1. Coloque uma imagem em `assets/fanarts/` na branch `main`.
2. Use o padrão `artista--descricao.extensao`, por exemplo `belle--nihilguh.webp` ou `maria--gatinho.png`.
3. Após o GitHub Pages publicar a alteração, recarregue a Browser Source do OBS para mostrar a nova imagem imediatamente. A cena também verifica a lista novamente a cada 5 minutos quando está visível.

São aceitos: PNG, JPG/JPEG, WebP, GIF e AVIF. O trecho antes do primeiro `--` é exibido como o **crédito do artista**; hífens e sublinhados viram espaços. Nomes sem o separador usam todo o nome do arquivo como crédito.

Com uma imagem, o card fica centralizado. Com duas ou mais, o carrossel desliza a cada 6,5 segundos. Os parâmetros existentes `?minutes=10` e `?motion=0` continuam funcionando; com movimento desligado, a galeria não avança automaticamente.

## Como funciona

Como o GitHub Pages é estático e não lista diretórios, `0-iniciando/fanarts.js` consulta a [API pública de conteúdo do GitHub](https://docs.github.com/en/rest/repos/contents#get-repository-content) para encontrar as imagens. Não é preciso atualizar o HTML ou um manifesto manualmente.

**Limitação:** é necessário que o repositório permaneça público e que o acesso à API do GitHub esteja disponível. Se a conexão falhar, o site mostra a primeira fanart conhecida (`belle--nihilguh.webp`) como alternativa. Imagens recém-adicionadas só aparecem quando o GitHub Pages as publicar e a API retornar a lista atualizada.

Arte inicial recebida do chat da Twitch, crédito exibido: Belle. A imagem foi enquadrada sem incluir a interface do chat, mantendo o desenho completo.
