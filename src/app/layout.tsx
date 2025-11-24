import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "RAG Doc Bot",
    description: "Ask questions about your documents using AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
