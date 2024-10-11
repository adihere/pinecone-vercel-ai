export const metadata = {
  title: "Architecture Bot ",
  description: "Pinecone - Vercel GenAI - Architecture Bot ",
};

import "../global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
