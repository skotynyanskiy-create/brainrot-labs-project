# Assets 3D

Questa cartella contiene la pipeline sorgente per gli asset 3D del progetto.

## Regole

- `source/` contiene i file di authoring come `.blend`
- `exports/` contiene gli asset runtime da verificare prima di copiarli in `public/models`
- `textures/` contiene texture di test o reference
- `thumbs/` contiene preview statiche per controllo rapido
- `spec.json` è la sorgente di verità per scala, area stampabile, export e camera

## Processo

1. aggiorna `spec.json`
2. modifica il master model in `source/`
3. esporta il runtime model in `exports/`
4. testa il modello nel viewer
5. solo dopo promuovi l'asset in `public/models`
