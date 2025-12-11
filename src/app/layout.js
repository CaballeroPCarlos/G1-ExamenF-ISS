// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/Header";
import { UserProvider } from "@/context/UserContext"; // Client Component

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Sistema Seguro - Colegio Santa María de Breña",
  description: "Módulo de software seguro académico",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Client components dentro de body */}
        <UserProvider>
          <Header />
          <main style={{ padding: "20px", minHeight: "80vh" }}>
            {children}
          </main>
        </UserProvider>
        <footer
          style={{
            padding: "10px 20px",
            textAlign: "center",
            backgroundColor: "#f0f0f0",
            borderTop: "1px solid #ccc",
          }}
        >
          &copy; {new Date().getFullYear()} Colegio Santa María de Breña
        </footer>
      </body>
    </html>
  );
}
