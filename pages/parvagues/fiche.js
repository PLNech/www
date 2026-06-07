import Layout from '@/components/parvagues/Layout';
import { FaEnvelope, FaPrint, FaLaptopCode, FaSlidersH, FaVolumeUp, FaVideo, FaPlug, FaClock } from 'react-icons/fa';

const SHOW_INFOS = [
  { label: 'Format', value: 'Solo · livecoding' },
  { label: 'Genres', value: 'Algorave · Techno · DnB · Breakbeat' },
  { label: 'Durée du set', value: '45 min – 1 h 15 (modulable)' },
  { label: 'Outils', value: 'TidalCycles · SuperCollider · visuels code' },
];

const ARTIST_BRINGS = [
  'Laptop (Linux) avec tout le système son et vidéo',
  'Contrôleur MIDI Novation Launch Control XL',
  'Adaptateur secteur (prise EU / type C+E)',
];

const VENUE_PROVIDES = [
  { icon: FaVolumeUp, title: 'Audio', items: [
      'Câblage à fournir : sortie laptop en jack 3.5 stéréo → 2× jack 6.35 mono ou XLR vers la console FOH (DI actives bienvenues)',
      'Entrée stéréo sur la console FOH (2 canaux liés L/R)',
      'Un retour son sur scène — haut-parleur posé devant l’artiste (« wedge ») ou casque in-ear — pour entendre le mix en jeu',
    ]
  },
  { icon: FaVideo, title: 'Vidéo', items: [
      'Câblage HDMI à fournir depuis le laptop jusqu’au vidéoprojecteur ou écran (longueur adaptée à la distance régie / scène)',
      'Sortie 1080p (1920×1080)',
      'Écran ou projection visible par le public — devant, derrière ou au-dessus de l’artiste — le code fait partie du show',
    ]
  },
  { icon: FaPlug, title: 'Électricité', items: [
      '1× prise secteur 230 V à proximité du desk (multiprise OK)',
      'Pas de demande spécifique en puissance',
    ]
  },
  { icon: FaSlidersH, title: 'Plateau / desk', items: [
      'Surface stable type table ou flight (~80 × 60 cm minimum)',
      'Hauteur debout (~ 95–105 cm) idéale, assis acceptable',
      'Lumière douce sur scène — éviter projecteurs directs sur l’écran du laptop',
    ]
  },
];

const STAGE_NOTES = [
  {
    title: 'Configuration idéale',
    text: 'Laptop surélevé (laptop stand ou case retournée, ~15 cm) avec le contrôleur MIDI Launch Control aligné devant, à hauteur de mains. Les deux dans l’axe de l’artiste.',
  },
  {
    title: 'Configuration acceptable',
    text: 'Laptop et Launch Control côte à côte sur la même surface, laptop légèrement orienté vers l’artiste pour garder la lecture du code confortable.',
  },
];

const TIMINGS = [
  { label: 'Installation', value: '15 min' },
  { label: 'Balance / soundcheck', value: '10 min' },
  { label: 'Démontage', value: '10 min' },
];

function Section({ id, title, children }) {
  return (
    <section id={id} className="reveal py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-display text-xl md:text-2xl font-bold tracking-[0.15em] uppercase">
          {title}
        </h2>
        <div className="h-px bg-white/10 mt-3 mb-6" />
        {children}
      </div>
    </section>
  );
}

function StagePlot() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 md:p-8">
      <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)] mb-4">
        Plan de scène — vue de dessus
      </p>
      <svg
        viewBox="0 0 400 240"
        className="w-full max-w-md mx-auto"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Plan de scène ParVagues"
      >
        {/* Desk */}
        <rect
          x="60" y="80" width="280" height="120"
          rx="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.6"
        />
        <text x="200" y="216" textAnchor="middle" fontSize="9" fill="currentColor" letterSpacing="2">
          DESK ~80 × 60 cm
        </text>

        {/* Laptop (raised, back) */}
        <rect
          x="150" y="100" width="100" height="38"
          rx="3"
          fill="rgba(217,0,255,0.12)"
          stroke="rgba(217,0,255,0.7)"
          strokeWidth="1.5"
        />
        <text x="200" y="123" textAnchor="middle" fontSize="10" fill="white" fontWeight="600">
          LAPTOP
        </text>
        <text x="200" y="134" textAnchor="middle" fontSize="7" fill="white" opacity="0.6">
          surélevé
        </text>

        {/* Launch Control (front) */}
        <rect
          x="135" y="150" width="130" height="34"
          rx="3"
          fill="rgba(0,255,213,0.10)"
          stroke="rgba(0,255,213,0.7)"
          strokeWidth="1.5"
        />
        <text x="200" y="171" textAnchor="middle" fontSize="10" fill="white" fontWeight="600">
          LAUNCH CONTROL
        </text>

        {/* Cables out */}
        <text x="40" y="120" fontSize="8" fill="currentColor" textAnchor="end">
          ← HDMI
        </text>
        <line x1="45" y1="115" x2="150" y2="115" stroke="currentColor" strokeWidth="1" opacity="0.4" />

        <text x="40" y="135" fontSize="8" fill="currentColor" textAnchor="end">
          ← Audio L/R
        </text>
        <line x1="45" y1="130" x2="150" y2="130" stroke="currentColor" strokeWidth="1" opacity="0.4" />

        {/* Artist position */}
        <circle cx="200" cy="220" r="6" fill="rgba(217,0,255,0.6)" />
        <text x="200" y="238" textAnchor="middle" fontSize="9" fill="currentColor" letterSpacing="1">
          ARTISTE
        </text>

        {/* Audience direction */}
        <text x="200" y="40" textAnchor="middle" fontSize="9" fill="currentColor" letterSpacing="3">
          PUBLIC / FOH
        </text>
        <line x1="180" y1="50" x2="220" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <polygon points="195,46 195,54 188,50" fill="currentColor" opacity="0.4" />
      </svg>
    </div>
  );
}

export default function FicheTechnique() {
  return (
    <Layout title="ParVagues — Fiche Technique">
      {/* Hero */}
      <section className="pt-32 pb-10 md:pt-40 md:pb-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)] mb-4">
            Fiche technique
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            ParVagues — Livecoding
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-4">
            Mise à jour {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>

          <div className="flex justify-center gap-3 mt-8 print:hidden">
            <button
              onClick={() => typeof window !== 'undefined' && window.print()}
              className="flex items-center gap-2 px-5 py-2.5 text-[11px] tracking-[0.15em] uppercase border border-white/15 rounded-full hover:bg-white hover:text-[var(--surface)] transition-all duration-300"
            >
              <FaPrint className="w-3 h-3" /> Imprimer / PDF
            </button>
            <a
              href="mailto:parvagues@nech.pl"
              className="flex items-center gap-2 px-5 py-2.5 text-[11px] tracking-[0.15em] uppercase bg-white text-[var(--surface)] rounded-full hover:bg-[var(--neon-high)] hover:text-white hover:shadow-[0_0_30px_rgba(217,0,255,0.3)] transition-all duration-300"
            >
              <FaEnvelope className="w-3 h-3" /> Contact
            </a>
          </div>
        </div>
      </section>

      {/* Show info */}
      <Section id="show" title="Le Show">
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {SHOW_INFOS.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-1">
                {label}
              </dt>
              <dd className="text-sm md:text-base">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-[var(--text-muted)] mt-8 leading-relaxed">
          Set électronique composé avec du code et joué en temps réel en
          performance live. Chaque session est unique. Le code s’anime et
          s’active selon les sons, rendant une dimension visuelle aux musiques
          jouées sur scène.
        </p>
      </Section>

      {/* Artist provides */}
      <Section id="artist" title="Apport artiste">
        <ul className="space-y-2.5">
          {ARTIST_BRINGS.map((item) => (
            <li key={item} className="flex gap-3 text-sm md:text-base">
              <FaLaptopCode className="w-3.5 h-3.5 mt-1.5 shrink-0 text-[var(--neon-high)]/60" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Venue requirements */}
      <Section id="rider" title="Demande technique">
        <div className="grid md:grid-cols-2 gap-6">
          {VENUE_PROVIDES.map(({ icon: Icon, title, items }) => (
            <div
              key={title}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-4 h-4 text-[var(--neon-high)]/70" />
                <h3 className="font-display font-bold text-sm tracking-[0.15em] uppercase">
                  {title}
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-[var(--text-primary)]/90 leading-relaxed">
                {items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className="text-[var(--neon-high)]/50 mt-1.5 shrink-0">·</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Stage plot */}
      <Section id="stage" title="Plan de scène">
        <div className="space-y-6">
          <StagePlot />
          <div className="grid sm:grid-cols-2 gap-4">
            {STAGE_NOTES.map(({ title, text }) => (
              <div key={title} className="border-l-2 border-[var(--neon-high)]/30 pl-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-1">
                  {title}
                </p>
                <p className="text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Timings */}
      <Section id="timings" title="Timing">
        <dl className="grid grid-cols-3 gap-4">
          {TIMINGS.map(({ label, value }) => (
            <div
              key={label}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"
            >
              <dt className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2 flex items-center justify-center gap-2">
                <FaClock className="w-3 h-3" />
                {label}
              </dt>
              <dd className="font-display font-bold text-base md:text-lg">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Contact */}
      <Section id="contact" title="Contact">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 md:p-8">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2">
            Booking & technique
          </p>
          <a
            href="mailto:parvagues@nech.pl"
            className="font-display text-lg md:text-xl font-bold hover:text-[var(--neon-high)] transition-colors"
          >
            parvagues@nech.pl
          </a>
          <p className="text-sm text-[var(--text-muted)] mt-4 leading-relaxed">
            Pour toute question technique, modification du plan, ou besoin
            spécifique : écrire avant le jour J. Pas de souci pour adapter à
            votre setup tant qu’on en discute en amont.
          </p>
        </div>
      </Section>

      {/* Print styles — densify */}
      <style jsx global>{`
        @media print {
          @page { margin: 12mm 14mm; size: A4; }

          /* Force light theme + remove decorative backgrounds */
          html, body, .parvagues-root {
            background: white !important;
            color: black !important;
          }
          .noise-overlay::before, .noise-overlay::after { display: none !important; }

          /* Hide chrome */
          header, footer { display: none !important; }
          .print\\:hidden { display: none !important; }

          /* Reveal animations off */
          .reveal { opacity: 1 !important; transform: none !important; }

          /* Tighten hero */
          main > section:first-child {
            padding-top: 0 !important;
            padding-bottom: 8px !important;
          }
          main > section:first-child h1 { font-size: 22pt !important; margin: 0 !important; }
          main > section:first-child p { margin: 2px 0 !important; font-size: 9pt !important; }

          /* Tighten every section */
          main section { padding: 8px 0 !important; }
          main section > div { padding-left: 0 !important; padding-right: 0 !important; max-width: none !important; }

          /* Section titles */
          h2 {
            font-size: 11pt !important;
            margin: 0 0 4px !important;
            page-break-after: avoid;
          }
          h2 + div { margin: 0 0 6px !important; height: 1px !important; }

          /* Body text */
          p, li, dd, dt, span, a, text { color: black !important; }
          p, li, dd { font-size: 9.5pt !important; line-height: 1.35 !important; }
          dt { font-size: 7.5pt !important; letter-spacing: 0.1em !important; }
          .text-\\[var\\(--text-muted\\)\\], [class*="text-muted"] { color: #444 !important; }

          /* Cards: thinner padding, no fill */
          .bg-white\\/\\[0\\.03\\], .bg-white\\/\\[0\\.04\\] { background: transparent !important; }
          .border-white\\/\\[0\\.06\\], .border-white\\/\\[0\\.08\\], .border-white\\/10, .border-white\\/15, .border-white\\/20 { border-color: #bbb !important; }
          [class*="rounded"] { border-radius: 4px !important; }
          .p-5, .p-6, .p-8, .md\\:p-8 { padding: 8px 10px !important; }
          .p-4 { padding: 6px 8px !important; }

          /* Grids: keep as-is but reduce gaps */
          [class*="gap-"] { gap: 8px !important; }

          /* Page-break hygiene */
          section, .stage-plot, dl, ul { page-break-inside: avoid; }

          /* Stage plot SVG smaller */
          svg { max-width: 320px !important; max-height: 180px !important; }

          /* Neon accents → black */
          [style*="--neon-high"], .text-\\[var\\(--neon-high\\)\\] { color: black !important; }

          /* Remove drop shadows */
          * { box-shadow: none !important; text-shadow: none !important; }

          a { text-decoration: none !important; }
        }
      `}</style>
    </Layout>
  );
}
