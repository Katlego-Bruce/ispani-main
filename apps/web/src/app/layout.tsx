import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ispani - Labour Marketplace',
  description: 'Trusted labour marketplace and fintech platform for South Africa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
