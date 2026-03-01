import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plano Pace — Seu Treinador Virtual de Corrida',
  description: 'Planilhas personalizadas por IA, integração com Strava e evolução em tempo real. Seu treinador virtual autônomo de corrida.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Plano Pace — Seu Treinador Virtual de Corrida',
    description: 'Planilhas personalizadas por IA, integração com Strava e evolução em tempo real.',
    siteName: 'Plano Pace',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
