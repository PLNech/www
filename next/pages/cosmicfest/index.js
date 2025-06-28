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
                <h3>{item.artist} <span className={styles.cardEmojis}>~ {item.emojis} ~</span></h3>
                <p>{item.description}</p>
                {/* The emoji line is now part of the h3, the extra <p> for emojis and <br/> are removed */}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="v0">
          <h2>souvenirs de la v0 ({nextFestivalDate.getFullYear() -1 })</h2>

          <h3>photos v0</h3>
          <div className={styles.gallery}>
            {v0_content.photos.map((photo, index) => (
              <div key={index} className={styles.galleryPhotoItem} style={{backgroundImage: `url(${photo.src})`}}>
                 {/* <Image src={photo.src} alt={photo.alt} width={200} height={150} objectFit="cover" /> */}
                 {/* Using div with background for now, as next/image needs actual image dimensions for non-fill */}
                 <span>{photo.alt}</span>
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
              <a
                key={index}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.galleryItem} ${styles.galleryVideoLink}`}
                style={video.src ? {backgroundImage: `url(${video.src})`} : {}} // Apply BG only if src exists
                aria-label={`Watch video: ${video.title}`}
              >
                <span>{video.title}</span> {/* Span for styling the text overlay */}
              </a>
            ))}
          </div>

          <h3 style={{marginTop: '2rem'}}>lineup v0</h3>
          <ul>
            {v0_content.lineup.map((artist, index) => (
              <li key={index}>{artist}</li>
            ))}
          </ul>

          <h3 style={{marginTop: '2rem'}}>audio ~ ParVagues</h3>
          <p>
            ecoute chaque piste ~ ecoute le set entier ~ telecharge le tout
          </p>
          <div className={styles.audioPlayersContainer}>
            <div className={`${styles.audioEmbed} ${styles.bandcampPlayer}`}>
              <iframe title="Bandcamp player for Parvagues live at Cosmicfest" style={{border: 0, width: "100%", maxWidth: "350px", height: "470px"}} src="https://bandcamp.com/EmbeddedPlayer/album=644862623/size=large/bgcol=333333/linkcol=0f91ff/tracklist=true/artwork=small/transparent=true/" seamless><a href="https://parvagues.bandcamp.com/album/live-cosmicfest">live@cosmicfest by ParVagues</a></iframe>
            </div>
            <div className={`${styles.audioEmbed} ${styles.soundcloudPlayer}`}>
              <iframe title="Soundcloud player for Parvagues live at Cosmicfest" width="100%" height="450" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2121089043&color=%233e00f7&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style={{fontSize: "10px", color: "#cccccc",lineBreak: "anywhere",wordBreak: "normal",overflow: "hidden",whiteSpace: "nowrap",textOverflow: "ellipsis", fontFamily: "Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif",fontWeight: "100"}}><a href="https://soundcloud.com/parvagues" title="ParVagues" target="_blank" rel="noopener noreferrer" style={{color: "#cccccc", textDecoration: "none"}}>ParVagues</a> · <a href="https://soundcloud.com/parvagues/cosmicfest" title="Live@cosmicfest 🌊🌅" target="_blank" rel="noopener noreferrer" style={{color: "#cccccc", textDecoration: "none"}}>Live@cosmicfest 🌊🌅</a></div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="next-edition">
          <h2>prochaine édition:<br/>{nextFestivalDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</h2>
          <div className={styles.countdownContainer}> {/* Added class for styling countdown section */}
            <Countdown targetDate={nextFestivalDate.toISOString()} />
          </div>
          <div style={{textAlign: 'center', marginTop: '2rem'}}>
           <a
             href="mailto:cosmic@nech.pl?subject=je%20suis%20cosmic%20car...&body=voila%20mon%20cot%C3%A9%20cosmique%20%3A%20..."
             className={styles.ctaButton}
           >
             prends la prochaine vague
           </a>
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
