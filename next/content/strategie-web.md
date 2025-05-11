# Stratégie Web ParVagues - Mai 2025

## Vue d'ensemble

Mise en place d'un système complet de gestion d'événements live sur le site ParVagues avec :
- Landing page redessinée (cyberpunk aesthetic)
- Pages d'événements dynamiques avec countdown
- Système de teasings programmés
- Galerie de photos automatique

## Architecture Implémentée

### Structure des Fichiers
```
next/
├── pages/
│   ├── parvagues.js (nouvelle landing)
│   └── parvagues/live/[id].js (pages événements)
├── components/
│   └── ImageGallery.js (gallery masonry)
├── lib/
│   └── livesData.js (logique de chargement)
├── content/lives/
│   ├── 2025/
│   │   ├── ensad-2025-05-22.md
│   │   └── algorave-lyon-2025-XX-XX.md
│   └── _template.md
└── public/images/parvagues/lives/
    └── [year]/[event-slug]/
```

### Fonctionnalités Clés

#### 1. Système d'Events Live
- **URL pattern**: `/parvagues/live/[slug]`
- **Countdown dynamique** : J-14, J-7, J-3 avec teasings différents
- **Mode pre/post** : Affichage conditionnel selon la date
- **Metadata YAML** : title, date, location, teasings, etc.

#### 2. Landing Page
- **Cyberpunk design** : Dark theme + purple/pink gradients
- **Rain effects** : Animations canvas pour atmosphère
- **Code samples** : Syntax highlighting TidalCycles
- **Events sidebar** : Liste des événements à venir/passés

#### 3. Galerie de Photos
- **Masonry layout** : Disposition automatique des images
- **Lightbox** : Vue agrandie des photos
- **Auto-detection** : Scan du dossier pour images

## Événements Programmés

### ENSAD Paris - 22 Mai 2025
- **Date**: 2025-05-22, 18:30-20:00
- **URL**: `/parvagues/live/ensad-2025-05-22`
- **Short link**: `nech.pl/ensad`
- **Teasings**: 3 phases programmées avec code TidalCycles

### AlgoRave Lyon - Date TBD
- **URL**: `/parvagues/live/algorave-lyon-2025-XX-XX`
- **Short link**: `nech.pl/lyon`  
- **Status**: Template créé, à finaliser

## Workflow d'Utilisation

### Ajouter un Nouvel Événement
1. **Créer le fichier markdown**:
   ```bash
   cp content/lives/_template.md content/lives/2025/mon-event-YYYY-MM-DD.md
   ```

2. **Ajouter les images**:
   ```bash
   mkdir -p public/images/parvagues/lives/2025/mon-event-YYYY-MM-DD/
   # Puis copier les photos (jpg/png/gif/webp)
   ```

3. **Configurer l'URL courte**:
   - Créer `nech.pl/monlien` → `/parvagues/live/mon-event-YYYY-MM-DD`

## Stratégie de Communication

### Timeline Promo ENSAD
- **J-7**: Post Instagram avec teasing1 + lien nech.pl/ensad
- **J-3**: Stories avec countdown
- **J-DAY**: Live updates sur Instagram/Bluesky/Mastodon

### Content Strategy
- **Pre-event**: Focus sur l'attente, mystery, code samples
- **Post-event**: Archives, photos, liens streaming
- **Teasings**: Progression narrative avec révélations

## Next Steps

### Technique
1. **Installer dépendances**:
   ```bash
   npm install marked prismjs react-masonry-css
   ```

2. **Remplacer placeholders** par vraies images
3. **Setup URL shortener** pour nech.pl/{ensad,lyon,parvagues}

### Content
1. **Photos ENSAD**: Préparer visuels pour le 22 mai
2. **Code samples**: Sélectionner meilleurs exemples TidalCycles
3. **Bio/description**: Finaliser texte de présentation

### Marketing
1. **Cross-platform**: Instagram → Mastodon → Bluesky
2. **Tracking**: Mesurer trafic via URL courtes
3. **Community**: Engager Cookie collective

## Architecture Technique

### Frontend
- **Next.js** : Static generation avec revalidation
- **Prism.js** : Syntax highlighting pour code Haskell
- **Masonry CSS** : Layout gallery responsive
- **Canvas animations** : Effets cyberpunk

### Data Flow
1. Pages pre-renders avec getStaticProps
2. Countdown updates côté client
3. Images chargées dynamiquement
4. Revalidation toutes les minutes

## Optimisations SEO

### Meta Tags
- Title dynamique par événement
- Description basée sur metadata
- Open Graph pour partage social

### Performance
- Images lazy loading
- Static generation
- Minimal JavaScript

## Maintenance

### Ajout d'Événement
- Simple : Copier template + ajouter images
- Auto-détection par filesystem
- Zero config pour nouveaux événements

### Archivage
- Passage auto pre→post event
- Photos visibles immédiatement
- Teasings cachés mais accessibles

---

**Status**: Prêt pour déploiement  
**Last Update**: 11 Mai 2025  
**Dependencies**: `marked prismjs react-masonry-css`
