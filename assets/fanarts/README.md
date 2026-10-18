# Fanarts da comunidade ♡

Todas as imagens nesta pasta são exibidas automaticamente no carrossel de `0-iniciando/`, em ordem alfabética.

## Como adicionar fanarts

1. Coloque uma imagem em `assets/fanarts/` na branch `main`.
2. Dê um nome único ao arquivo. O padrão `artista--descricao.extensao` é opcional e pode ajudar na organização interna.
3. Após o GitHub Pages publicar a alteração, recarregue a Browser Source do OBS para mostrar a nova imagem imediatamente. A cena também verifica a lista novamente a cada 5 minutos quando está visível.

São aceitos: PNG, JPG/JPEG, WebP, GIF e AVIF. **Nenhum nome, crédito, contador ou legenda é exibido** na tela da live; os nomes dos arquivos servem apenas para organizar as imagens.

A galeria mostra **uma imagem centralizada por vez**, em tamanho máximo com `object-fit: contain`, sem recorte, bordas ou preenchimento preto: as áreas não ocupadas pela imagem ficam transparentes. Com duas ou mais imagens, o carrossel desliza a cada 6,5 segundos. O layout é responsivo, inclusive em 9:16. Os parâmetros `?minutes=10` e `?motion=0` continuam funcionando; com movimento desligado, a galeria não avança automaticamente.

## Como funciona

Como o GitHub Pages é estático e não lista diretórios, `0-iniciando/fanarts.js` consulta a [API pública de conteúdo do GitHub](https://docs.github.com/en/rest/repos/contents#get-repository-content) para encontrar as imagens. Não é preciso atualizar o HTML ou um manifesto manualmente.

**Limitação:** é necessário que o repositório permaneça público e que o acesso à API do GitHub esteja disponível. Se a conexão falhar, o site mantém as 18 fanarts do acervo inicial em uma lista local de reserva. Imagens recém-adicionadas só aparecem quando o GitHub Pages as publicar e a API retornar a lista atualizada.

## Acervo inicial

Este lote reúne **18 artes** enviadas na conversa. A foto de melhor resolução recebida da fanart da **Belle** substitui a versão pequena da captura do chat, evitando duplicação.

Os nomes originais de 17 artes não permitiram confirmar com segurança os artistas. Elas usam o prefixo de organização **comunidade--**, que não aparece como legenda na live.

Além da descoberta automática pela API, o JavaScript mantém uma lista local das 18 artes como reserva quando houver falha na consulta ao GitHub. Imagens novas continuam sendo descobertas sem alterações manuais se a API estiver disponível.
