import "./globals.css";

export const metadata = {
  title: "Restaurant Management",
  description: "Restaurant menu, orders, reservations, and admin dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="corporate">
      <body className="min-h-screen bg-base-200">{children}</body>
    </html>
  );
}
