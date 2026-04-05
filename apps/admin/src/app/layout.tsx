import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ispani Admin',
  description: 'Super Admin Panel for Ispani Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
