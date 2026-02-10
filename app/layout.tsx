import type { Metadata } from "next";
import "./globals.css";
import FacebookPixel from "@/components/FacebookPixel";

export const metadata: Metadata = {
    title: "A Rebel's Romance | February Italian Pop-Up",
    description: "Experience handmade pasta and Italian romance at Rebellion Beachside Bar & Bistro. February only.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-void antialiased">
                <FacebookPixel />
                {children}
            </body>
        </html>
    );
}
