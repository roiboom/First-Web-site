import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';

export const metadata = {
  title: 'Student Portal | Academic Management System',
  description: 'A modern, professional student portal for managing academics, attendance, grades, and communications.',
};

export default function RootLayout({ children }) {
  return (
    <LanguageProvider>
      <html lang="en" suppressHydrationWarning>
        <body>{children}</body>
      </html>
    </LanguageProvider>
  );
}
