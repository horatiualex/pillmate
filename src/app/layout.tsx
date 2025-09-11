import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from '@/components/ThemeRegistry';
import Layout from '@/components/Layout';
import AuthProvider from '@/providers/AuthProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PillMate",
  description: "Medication management and pill scanning application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeRegistry>
            <Layout>{children}</Layout>
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
