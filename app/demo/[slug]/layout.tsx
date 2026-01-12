import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Agent Demo",
  description: "Try our AI-powered voice assistant",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
