import Head from 'next/head';
import Image from 'next/image'; // Using Next.js Image component for optimization
import styles from '../../styles/cosmicfest.module.css';
import Countdown from '../../components/cosmicfest/Countdown';
// import ParVaguesFooter from '../../components/ParVaguesFooter'; // Optional: if you want to reuse the main site footer

// Helper function to calculate next June 21st
const getNextJune21st = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  let nextJune21 = new Date(currentYear, 5, 21); // Month is 0-indexed (5 is June)

  if (today > nextJune21) {
    nextJune21 = new Date(currentYear + 1, 5, 21);
  }
  return nextJune21;
};

export default function CosmicFestHome() {
  const nextFestivalDate = getNextJune21st();

  const lineup2024 = [
    { artist: "Hugo", description: "live guitare, compos et reprises", emojis:"🎸🎙️" },
    { artist: "Flo", description: "live machines downtempo", emojis:"⚙️🎛" },
    { artist: "ParVagues", description: "livecoding breakbeat to techno nujazz", emojis:"💻🎛️" },
    { artist: "DJ @marion.lhn", description: "set drum-n-bass",  emojis: "💻📀" },
    { artist: "Kevin & Pipou", description: "lights et visuels interactifs", emojis:"💻📽️" },
    { artist: "PLN", description: "visuels Hydra.js", emojis:"💻📽" },
  ];

  // Placeholder data for v0
  const v0_content = {
    photos: [
      { src: '/images/cosmicfest/v0_hugo.jpg', alt: 'v0 ~ hugo à la guitare' },
      { src: '/images/cosmicfest/v0_parvagues_lineup.jpg', alt: 'v0 ~ parvagues ~ line-up' },
      { src: '/images/cosmicfest/hero.gif', alt: 'v0 ~ le off au bunker' },
    ],
    videos: [
      { id: '6uoO282xJXM', src: '/images/cosmicfest/v0_parvagues_lineup_crop.jpg', title: 'scene v0 - parvagues livecoding' },
      // { id: 'YOUTUBE_VIDEO_ID_V0_PERFORMANCE_2', title: 'live performance v0 - artiste y' },
    ],
    aftermovie: { id: 'YOUTUBE_VIDEO_ID_V0_AFTERMOVIE', title: 'aftermovie cosmicfest v0', released: false },
    lineup: [
      "20h ~ hugo ~ guitare",
      "21h ~ flo ~ downtempo",
      "22h ~ parvagues ~ livecoding",
      "23h ~ marion.lhn ~ set dnb",
      "00+ ~ jam"
    ]
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>cosmicfest</title>
        <meta name="description" content="cosmicfest - festival indé de musique et création numérique à Labenne Océan. 21 juin." />
        <link rel="icon" href="/favicon.ico" /> {/* Consider a specific cosmicfest favicon */}
      </Head>

      <main className={styles.main}>
        <header className={styles.hero}>
          {/* Hero image is set via CSS background for now */}
          <h1>🌠 cosmicfest 🌌</h1>
          <h3 style={{ paddingTop: '1em' }}>
            ondes de rythmes, plages sonores, et code source.
          </h3>
          <h2>21 juin, labenne océan.<br />🪐</h2>
        </header>

        <section className={styles.section} id="lineup">
          <h2>lineup {new Date().getFullYear()}</h2>
          <div className={styles.grid}>
            {lineup2024.map((item, index) => (
              <div key={index} className={styles.card}>
                <h3>{item.artist}</h3>
                <p>{item.description}</p><br/>
                <p>~ {item.emojis} ~</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="v0">
          <h2>souvenirs de la v0 ({nextFestivalDate.getFullYear() -1 })</h2>

          <h3>photos v0</h3>
          <div className={styles.gallery}>
            {v0_content.photos.map((photo, index) => (
              <div key={index} style={{backgroundImage: `url(${photo.src})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '150px'}}>
                 {/* <Image src={photo.src} alt={photo.alt} width={200} height={150} objectFit="cover" /> */}
                 {/* Using div with background for now, as next/image needs actual image dimensions for non-fill */}
                 <span style={{color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px'}}>{photo.alt}</span>
              </div>
            ))}
          </div>

          <h3 style={{marginTop: '2rem'}}>vidéos v0</h3>
          <div className={styles.gallery}>
            {/* Aftermovie */}
            {v0_content.aftermovie.released && (
              <div>
                <a href={`https://www.youtube.com/watch?v=${v0_content.aftermovie.id}`} target="_blank" rel="noopener noreferrer">
                  {v0_content.aftermovie.title} (placeholder: {v0_content.aftermovie.id})
                </a>
              </div>
            )}
            {/* Other videos */}
            {v0_content.videos.map((video, index) => (
              <div key={index} style={{backgroundImage: `url(${video.src})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '150px'}}>
                <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                  {video.title}
                </a>
              </div>
            ))}
          </div>

          <h3 style={{marginTop: '2rem'}}>lineup v0</h3>
          <ul>
            {v0_content.lineup.map((artist, index) => (
              <li key={index}>{artist}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section} id="next-edition">
          <h2>prochaine édition:<br/>{nextFestivalDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</h2>
          <div className={styles.countdownContainer}> {/* Added class for styling countdown section */}
            <Countdown targetDate={nextFestivalDate.toISOString()} />
          </div>
          <div style={{textAlign: 'center', marginTop: '2rem'}}>
            <button className={styles.ctaButton} onClick={() => alert('waitlist bientôt disponible!')}>
              prends la prochaine vague
            </button>
            <p className={styles.waitlistMessage}>
              pas de billetterie - cosmicfest c'est sur invitation. <br/>
              riders, come to the storm.
            </p>
          </div>
        </section>

        <section className={styles.section} id="off-festival">
          <h2>🏄🏻‍♀️ et le off? 🏄🏽</h2>
          <p style={{textAlign: 'center', fontStyle: 'italic'}}>
            🌊 RDV sur la plage ~ le dimanche soir après le démontage 🌊<br />
            🔊 pour le <b>dernier</b> live ~ au <b>bunker</b> 🔊
          </p>
        </section>

      </main>

      <footer className={styles.footer}>
        <a
          href="/parvagues/"
        >
          vibe ~
          <span style={{fontWeight: 'bold'}}>parvagues</span>
          {/* <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} /> You can use ParVagues logo here */}
        </a>
      </footer>
      {/* <ParVaguesFooter /> */} {/* Or use the existing footer */}
    </div>
  );
}
