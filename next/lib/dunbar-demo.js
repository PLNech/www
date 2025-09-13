// Demo dataset generator for Dunbar — 50 French profiles with clusters, relationships, events, birthdays, and rich profile fields.
// Usage:
//   import { generateDemoPayload } from '@/lib/dunbar-demo';
//   const payload = generateDemoPayload(50);
//   actions.loadFromPayload(payload);

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sample(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function pickN(arr, n) {
  const a = [...arr];
  const out = [];
  n = Math.min(n, a.length);
  for (let i = 0; i < n; i++) {
    const idx = randInt(0, a.length - 1);
    out.push(a[idx]);
    a.splice(idx, 1);
  }
  return out;
}
function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
function toYMD(d) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  // snap to UTC midnight
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Name pools — French + diverse origins
const FIRST_NAMES = [
  'Chloé','Lucas','Inès','Mehdi','Aya','Léa','Adam','Camille','Noah','Fatou','Hugo','Nina','Yanis','Aïcha',
  'Théo','Manon','Rayan','Jiwoo','Lina','Sofiane','Océane','Moussa','Clara','Youssef','Tao','Sacha','Zoé',
  'Naïm','Imane','Omar','Yara','Rachid','Samira','Lucie','Alexandre','Selma','Pierre','Karim','Leïla','Oce',
  'Val','Raph','Kyu','Igor','Sonia','Oceane','Mathis','Maëlys','Nora','Mina','Maya'
];
const LAST_NAMES = [
  'Dupont','Martin','Bernard','Durand','Moreau','Lefebvre','Fournier','Mercier','Faure','Andre',
  'Benali','El Mansouri','Traoré','Diop','Nguyen','Zhang','Haddad','Khan','Rossi','Gonzalez',
  'Peigné','Mahé Millet','Porte','Lefèvre','Petit','Renaud','Barbier','Lemaire','Noël','Boucher'
];

// Parisian clichés and tags
const PLACES = [
  'Canal Saint-Martin','Buttes-Chaumont','Montmartre','Bourse de Commerce','Belleville','Le Marais','Station F',
  'Parc Monceau','Jardin du Luxembourg','Bercy','Pont des Arts','Bastille','Aligre','Saint-Germain','Parc de la Villette'
];
const ACTIVITIES = [
  'apéro','expo','vernissage','vélo','café','pique-nique','concert','ciné','footing','meetup','brunch','fromages','boulot'
];
const TAGS = ['#apero','#expo','#vernissage','#velo','#run','#cafe','#picnic','#concert','#cine','#meetup','#famille','#boulot','#amis','#dodo','#art'];
const QUOTES = [
  'Toujours partant·e pour un café !','Jamais sans mon vélo.','Le fromage, c’est la vie.','On se fait un apéro ?',
  'Team Boulot-Boulot-Boulot.','Paris sous la pluie, c’est mieux.','Vélib’ et liberté.','Vivement le week-end !'
];
const FOOD_LIKES = ['fromage','pain','viennoiseries','tapas','sushi','ramen','couscous','tajine','falafel','galettes','crêpes','pizza','pasta'];
const FOOD_DISLIKES = ['choux de Bruxelles','réglisse','coriandre','anchois','abats'];
const CAR_MODELS = ['Twingo','Clio','208','Model 3','Zoé','C3','Yaris','Micra','206','Golf','Corsa'];
const WORKPLACES = ['Station F','Quartier Latour-Maubourg','La Défense','Bercy','Montparnasse','Opéra','Bastille','République','Nation'];

function makeNamePool(count) {
  const names = new Set();
  while (names.size < count) {
    names.add(`${sample(FIRST_NAMES)} ${sample(LAST_NAMES)}`);
  }
  return Array.from(names);
}

function generateClusters(count, minSize = 8, maxSize = 14) {
  const clusters = [];
  let remaining = count;
  while (remaining > 0) {
    const size = Math.min(remaining, randInt(minSize, maxSize));
    clusters.push(size);
    remaining -= size;
  }
  return clusters;
}

function connectGraph(friendIds, clusters) {
  // Build intra/inter cluster connections (undirected)
  const edges = new Set();
  let index = 0;
  const clusterSlices = clusters.map(size => {
    const slice = friendIds.slice(index, index + size);
    index += size;
    return slice;
  });

  // intra cluster
  for (const slice of clusterSlices) {
    const p = 0.4 + Math.random() * 0.2; // 0.4..0.6 dense
    for (let i = 0; i < slice.length; i++) {
      for (let j = i + 1; j < slice.length; j++) {
        if (Math.random() < p) {
          const a = slice[i], b = slice[j];
          const key = a < b ? `${a}::${b}` : `${b}::${a}`;
          edges.add(key);
        }
      }
    }
  }
  // inter cluster sparse bridges
  for (let c = 0; c < clusterSlices.length - 1; c++) {
    const a = sample(clusterSlices[c]);
    const b = sample(clusterSlices[c + 1]);
    const key = a < b ? `${a}::${b}` : `${b}::${a}`;
    edges.add(key);
  }
  return Array.from(edges).map(k => k.split('::'));
}

function generateEvents(friendIds, friendById, edges) {
  // Create shared event ids; distribute across last ~365 days
  const eventsByFriend = new Map(friendIds.map(id => [id, []]));
  const E = randInt(friendIds.length * 1.2, friendIds.length * 2.2);
  for (let i = 0; i < E; i++) {
    const date = toYMD(daysAgo(randInt(0, 360)));
    const place = sample(PLACES);
    const act = sample(ACTIVITIES);
    const note = `${act} ${place} ${sample(TAGS)} ${sample(TAGS)}`;
    // choose 1–4 participants: bias to connected pairs
    let participants = [];
    if (Math.random() < 0.6 && edges.length > 0) {
      const [a, b] = sample(edges);
      const group = [a, b];
      if (Math.random() < 0.5) group.push(sample(friendIds));
      if (Math.random() < 0.3) group.push(sample(friendIds));
      participants = Array.from(new Set(group));
    } else {
      participants = pickN(friendIds, randInt(1, 4));
    }
    const id = uid('ev');
    const ev = {
      id,
      date,
      notes: note,
      location: place,
      participants: participants,
    };
    for (const pid of participants) {
      eventsByFriend.get(pid).push(ev);
    }
  }
  // Sort newest first for lastInteraction logic ease
  for (const id of friendIds) {
    eventsByFriend.get(id).sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  return eventsByFriend;
}

export function generateDemoPayload(count = 50) {
  const names = makeNamePool(count);
  const friends = names.map(n => ({ id: uid('f'), name: n }));
  const friendIds = friends.map(f => f.id);

  // Split into 3–5 clusters
  const clusters = generateClusters(count, 8, 14);
  const edges = connectGraph(friendIds, clusters);

  // Build friend map shell with rich fields
  const friendById = new Map();
  for (const f of friends) {
    friendById.set(f.id, {
      id: f.id,
      name: f.name,
      birthday: toYMD(daysAgo(randInt(7000, 20000))), // 19–55 years old approx
      notes: `Ami·e rencontré·e à ${sample(PLACES)}. ${sample(TAGS)} ${sample(TAGS)}`,
      likes: `Aime ${sample(FOOD_LIKES)} et ${sample(ACTIVITIES)}`,
      dislikes: `N'aime pas ${sample(FOOD_DISLIKES)}`,
      foodLikes: sample(FOOD_LIKES),
      foodDislikes: sample(FOOD_DISLIKES),
      wifiPassword: Math.random().toString(36).slice(2, 10),
      carModel: sample(CAR_MODELS),
      workplace: sample(WORKPLACES),
      schedule: ['9h-17h','8h-16h','10h-18h','horaires flex'].slice(randInt(0,3)),
      futureIdeas: `Aller au ${sample(PLACES)}; ${sample(ACTIVITIES)}; ${sample(ACTIVITIES)}.`,
      quotes: sample(QUOTES),
      importantDates: [],
      gifts: [],
      postcards: [],
      relationships: new Set(),
      events: [],
      lastInteraction: null,
    });
  }

  // Relationships
  for (const [a, b] of edges) {
    friendById.get(a).relationships.add(b);
    friendById.get(b).relationships.add(a);
  }

  // Events
  const eventsByFriend = generateEvents(friendIds, friendById, edges);
  for (const id of friendIds) {
    const list = eventsByFriend.get(id) || [];
    friendById.get(id).events = list;
    friendById.get(id).lastInteraction = list.length ? list[0].date : null;
  }

  // Sprinkle important dates / gifts / postcards
  for (const id of friendIds) {
    const f = friendById.get(id);
    // 0–3 dates
    const k = randInt(0, 3);
    for (let i = 0; i < k; i++) {
      f.importantDates.push({
        date: toYMD(daysAgo(randInt(0, 365))),
        label: sample(['Concert','Déménagement','Nouvel emploi','Voyage','Soirée mémorable']),
      });
    }
    // 0–2 gifts
    const gk = randInt(0, 2);
    for (let i = 0; i < gk; i++) {
      f.gifts.push({
        date: toYMD(daysAgo(randInt(0, 365))),
        occasion: sample(['Anniversaire','Noël','Remerciement','Fête']),
        description: sample(['Livre','Bouteille de vin','Plante verte','Boîte de chocolats','Écharpe']),
        image: '',
      });
    }
    // 0–2 postcards
    const pk = randInt(0, 2);
    for (let i = 0; i < pk; i++) {
      f.postcards.push({
        date: toYMD(daysAgo(randInt(0, 365))),
        location: sample(['Bretagne','Marseille','Lyon','Biarritz','Annecy','Lisbonne','Rome']),
        description: sample(['Belle météo','Vieux port','Plage','Musées','Randonnée']),
        image: '',
      });
    }
  }

  // Convert to export payload shape (relationships: arrays)
  const outFriends = friendIds.map(id => {
    const f = friendById.get(id);
    return {
      id: f.id,
      name: f.name,
      birthday: f.birthday,
      notes: f.notes,
      likes: f.likes,
      dislikes: f.dislikes,
      foodLikes: f.foodLikes,
      foodDislikes: f.foodDislikes,
      wifiPassword: f.wifiPassword,
      carModel: f.carModel,
      workplace: f.workplace,
      schedule: f.schedule,
      futureIdeas: f.futureIdeas,
      quotes: f.quotes,
      importantDates: f.importantDates,
      gifts: f.gifts,
      postcards: f.postcards,
      relationships: Array.from(f.relationships),
      events: f.events.map(e => ({
        id: e.id,
        date: e.date,
        notes: e.notes,
        location: e.location,
        participants: e.participants,
      })),
    };
  });

  return {
    schema: 'dunbar-v1',
    version: '1.0.0',
    savedAt: new Date().toISOString(),
    selectedFriendId: null,
    friends: outFriends,
  };
}
