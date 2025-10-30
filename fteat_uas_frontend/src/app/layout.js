import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import "./custom.css";

export const metadata = {
  title: "FTEAT - Teknik Rekayasa Rasa",
  description: "Platform pemesanan makanan kampus",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
