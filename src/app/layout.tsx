import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachAI Vôlei",
  description: "Plataforma de IA para treinadores de voleibol planejarem treinos, times e temporadas.",
};

const themeScript = `
try {
  var stored = localStorage.getItem('coachai-theme');
  var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
