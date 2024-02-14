import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ReduxProvider from "@/redux/provider";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import bitsharelogo from '@/assets/bitsharelogo.png'
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BitShare",
  description: "A file sharing app"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={bitsharelogo.toString()} type=""  />
      </head>
      <body className={inter.className}>
        <ReduxProvider>
          <Navbar />
          {children}
          <ToastContainer />
        </ReduxProvider>
      </body>
    </html>
  );
}
