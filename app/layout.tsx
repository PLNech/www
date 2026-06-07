import '@/styles/tokens.css';
import '@/styles/globals.css';
import '@/styles/main.css';
import '@/styles/masonry.css';

export const metadata = {
  metadataBase: new URL('https://me.nech.pl'),
  title: {
    default: "PLN's Works",
    template: '%s · PLN',
  },
  description: "PLN's Selected Works",
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: "PLN's Works",
    url: 'https://me.nech.pl',
    siteName: "PLN's Works",
    type: 'website',
    description: "PLN's Selected Works",
    images: ['/images/profile.png'],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@PaulLouisNech',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
