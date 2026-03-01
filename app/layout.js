import './globals.css';

export const metadata = {
  title: 'Student Portal | Academic Management System',
  description: 'A modern, professional student portal for managing academics, attendance, grades, and communications.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
