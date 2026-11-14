import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Encontre a máquina ideal para sua limpeza — Kärcher Center Dikmaq",
  description:
    "Responda algumas perguntas sobre sua rotina e conheça as máquinas Dikmaq que combinam com o que você precisa. Sem cadastro.",
  keywords: ["quiz", "máquinas de limpeza", "Kärcher", "Dikmaq", "recomendação"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/clan-pro"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col text-balance">{children}</body>
    </html>
  );
}
