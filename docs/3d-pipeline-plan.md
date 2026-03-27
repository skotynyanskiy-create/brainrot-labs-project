# Brainrot Labs 3D Pipeline

## Obiettivo

Standardizzare la creazione dei modelli 3D e la personalizzazione dei prodotti in modo coerente con la pipeline già presente nel progetto:

- editor 2D a layer nel customizer
- export della texture finale
- preview 3D realtime
- asset print-ready per ecommerce e provider di stampa

Il progetto non richiede modelli 3D da configuratore tecnico. Richiede modelli web leggeri, aree stampabili affidabili e una corrispondenza stabile tra editor, preview e produzione.

## Stato attuale del repo

Pipeline esistente:

- il design viene composto in 2D in `src/components/customizer/ProductCustomizer.tsx`
- la texture viene esportata da canvas nascosto
- la preview 3D applica la texture su modelli dedicati in:
  - `src/components/product/Tshirt3DModel.tsx`
  - `src/components/product/PhoneCase3DModel.tsx`
  - `src/components/product/Poster3DModel.tsx`
- i dati prodotto e le aree stampabili sono definiti in `src/constants.ts`

Limite attuale:

- il mapping tra area stampabile 2D e superficie 3D è gestito in parte tramite overlay 2D e in parte tramite plane 3D posizionato a mano
- manca una specifica unica per asset, scala, pivot, UV, export e versioning

## Principio guida

Usare una sola sorgente di verità per prodotto:

1. spec del prodotto
2. modello master
3. area stampabile
4. settaggi camera/materiali
5. export runtime
6. export print-ready

## Struttura consigliata

```text
assets/
  3d/
    README.md
    products/
      tshirt/
        spec.json
        source/
        exports/
        textures/
        thumbs/
      phonecase/
        spec.json
        source/
        exports/
        textures/
        thumbs/
      poster/
        spec.json
        source/
        exports/
        textures/
        thumbs/
docs/
  3d-pipeline-plan.md
```

## Workflow completo

### 1. Product Spec

Per ogni prodotto base va creato e mantenuto un file `spec.json` con:

- id prodotto
- scala reale
- unità di misura
- pivot
- orientamento frontale
- area stampabile nominale
- formato texture
- risoluzione preview
- risoluzione print-ready
- formato export runtime
- materiali supportati
- settaggi camera

Questo file è la base per modellazione, integrazione e QA.

### 2. Modellazione in Blender

Per ogni prodotto:

1. crea o pulisci il master model
2. applica `Ctrl+A` a location, rotation e scale
3. centra il pivot in modo coerente con il viewer
4. separa se serve una mesh dedicata alla print area
5. mantieni topologia pulita e numero vertici basso
6. nomina gli oggetti in modo stabile

Naming minimo:

- `root_product`
- `body_base`
- `print_area_front`
- `print_area_back` se prevista in futuro

### 3. UV e superfici stampabili

Regola pratica:

- se il prodotto è semplice e la stampa è piatta, basta una print area mesh dedicata
- se la stampa deve seguire la superficie reale, la print area deve avere UV corrette e stabili

Per Brainrot Labs:

- t-shirt: mesh o surface dedicata sul petto frontale
- phone case: area posteriore con UV allineate al retro cover
- poster: plane frontale completo con margini controllati

Evita di affidarti solo a plane floating posizionati "a occhio" se il prodotto deve scalare a più modelli o varianti.

### 4. Export asset

Mantieni due livelli di export:

#### Authoring

- formato: `.blend`
- contiene collezioni, referenze, helper, print area, camera test

#### Runtime

- formato preferito: `.glb`
- materiali consolidati
- trasformazioni applicate
- mesh ottimizzata
- texture compresse solo se necessarie

Linee guida:

- target web: preferire file sotto 2-4 MB per modello base
- Draco/Meshopt solo se il caricamento reale ne beneficia
- niente texture 4K nei modelli runtime se il colore base è procedurale o semplice

Nota:

`STL` va bene solo per geometrie senza UV, ma è una scelta limitante. Per la cover è meglio pianificare migrazione a `.glb` appena vuoi un mapping più preciso del design.

### 5. Integrazione frontend

Il frontend va separato in tre responsabilità:

1. editor 2D
2. texture generator
3. 3D material application

#### Editor 2D

Resta nel customizer attuale:

- layer testo
- meme
- upload
- posizione e scala

#### Texture generator

Standardizzare output in tre profili:

- `preview`: 512x512
- `checkout`: 1024x1024
- `print`: 2048x2048 o superiore in base al prodotto

#### 3D material application

La preview deve leggere dal prodotto:

- `baseColor`
- `rendererType`
- `modelPath`
- `cameraPreset`
- `printSurface`

L'obiettivo è smettere di avere logica hardcoded sparsa tra componente modello e costanti prodotto.

### 6. Persistenza dati

Quando un design viene salvato o pubblicato, salva sempre:

- `baseProductId`
- `modelVersion`
- `printTemplateKey`
- `overlay`
- `textureProfile`
- `designTextureUrl`
- `layers`
- `containerSize`
- `exportedAt`

Così puoi rigenerare preview, migrare modelli e fare debug.

### 7. QA

Checklist minima per ogni prodotto:

1. la texture esportata combacia con l'area stampa 2D
2. il modello 3D mostra il design nella stessa posizione percepita
3. mobile e desktop mostrano la stessa proporzione
4. colore base coerente tra scheda prodotto e preview
5. peso asset accettabile
6. il tempo di caricamento non peggiora la UX del customizer
7. la resa finale è compatibile con il provider di stampa

## Flusso consigliato per prodotto

### T-Shirt

Pipeline migliore:

1. master `.blend` con torso frontale pulito
2. print area mesh sul petto
3. export `.glb`
4. materiale tessuto base dinamico via `baseColor`
5. texture design applicata solo alla print area

Priorità:

- prodotto principale
- miglior candidato per perfezionare tutta la pipeline

### Phone Case

Pipeline migliore:

1. convertire il flusso da `STL` a `.glb`
2. creare una print area back con UV reali
3. distinguere finitura `glossy` e `matte` solo a livello materiale
4. mantenere stesso design export della preview

Priorità:

- seconda
- oggi è il punto più fragile della pipeline per precisione visuale

### Poster

Pipeline migliore:

1. plane o cornice semplice
2. front plane completamente UV-mappato
3. texture design full surface
4. gestione varianti solo come metadato commerciale, non come modello diverso

Priorità:

- terza
- è il prodotto più semplice e stabile

## Roadmap di implementazione

### Fase 1

- creare e mantenere gli `spec.json`
- allineare `src/constants.ts` ai campi della spec
- introdurre un layer di configurazione 3D centralizzato

### Fase 2

- rifare o pulire t-shirt, phone case e poster
- creare print area mesh coerenti
- esportare runtime asset ottimizzati

### Fase 3

- refactor dei componenti 3D per leggere config centralizzata
- rimuovere misure hardcoded replicate nei componenti

### Fase 4

- introdurre export texture multi-profile
- aggiungere `modelVersion` e `textureProfile` ai dati salvati

### Fase 5

- QA visiva
- QA performance
- QA di corrispondenza con provider di stampa

## Decisioni tecniche consigliate

- usare Blender come tool di authoring
- usare `.glb` come formato runtime predefinito
- mantenere il customizer 2D come sorgente del design
- usare una print surface dedicata invece di overlay arbitrari dove possibile
- salvare design e metadati, non solo l'immagine finale
- trattare `STL` come formato legacy, non come standard futuro

## Sequenza pratica per partire subito

1. completare gli spec dei 3 prodotti base
2. rifinire prima la t-shirt
3. migrare la cover da `STL` a `GLB`
4. centralizzare configurazioni camera e print surface
5. alzare la qualità dell'export print-ready
6. solo dopo aggiungere nuovi prodotti

## Definizione di done

Un prodotto è completo quando:

- ha uno `spec.json`
- ha un master `.blend`
- ha un export runtime valido
- la texture preview combacia con la superficie visibile
- la texture print-ready è esportabile
- la preview 3D è stabile su desktop e mobile
- i dati del design sono versionati
