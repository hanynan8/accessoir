import { Rubik, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './components/Providers';
import LayoutShell from '../app/components/layoutshell';
import Cart, { CartNotification } from './components/cart';

const rubik = Rubik({
  variable: '--font-rubik-sans',
  subsets: ['latin', 'arabic'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
const crownSvg = `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 84 84"
     width="80"
     height="80">

  <rect width="84" height="84" rx="10" fill="transparent"/>

  <path d="M12 58 L20 34 L32 46 L42 26 L52 46 L64 34 L72 58 Z"
    fill="#000000" stroke="#000000" stroke-width="2" stroke-linejoin="round"/>

  <rect x="12" y="58" width="60" height="8" rx="3" fill="#000000"/>

  <circle cx="12" cy="34" r="3" fill="#000000"/>
  <circle cx="42" cy="26" r="3" fill="#000000"/>
  <circle cx="72" cy="34" r="3" fill="#000000"/>

</svg>
`;

const faviconDataUrl = `data:image/svg+xml;base64,${Buffer.from(crownSvg).toString('base64')}`;

export const metadata = {
  title: 'بازار دوحه | Bazar Doha',
  description: 'وجهتك الأولى للتسوق الفاخر — إكسسوارات ومنتجات عناية للرجال والحريم',
  keywords: 'بازار دوحه, إكسسوارات, عناية بشرة, تسوق فاخر, قطر',
  metadataBase: new URL('https://bazardoha.vercel.app'),
  icons: {
    icon: faviconDataUrl,
    shortcut: faviconDataUrl,
    apple: faviconDataUrl,
  },
  openGraph: {
    title: 'بازار دوحه | Bazar Doha',
    description: 'وجهتك الأولى للتسوق الفاخر — إكسسوارات ومنتجات عناية للرجال والحريم',
    url: 'https://bazardoha.vercel.app',
    siteName: 'بازار دوحه',
    locale: 'ar_QA',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${rubik.className} ${geistMono.variable} antialiased`}>
        <Providers>
          <Cart />
          <CartNotification />
          <LayoutShell>{children}</LayoutShell>

          {/* ── WhatsApp Floating Button ── */}
          <a
            href="https://wa.me/201107395195"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1ebe5d] hover:scale-110 transition-all duration-300"
            aria-label="WhatsApp"
          >
            <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
              <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.647 4.83 1.78 6.86L2 30l7.34-1.74A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 0 1-5.83-1.594l-.418-.248-4.332 1.028 1.054-4.228-.272-.434A11.47 11.47 0 0 1 4.5 16C4.5 9.648 9.648 4.5 16 4.5S27.5 9.648 27.5 16 22.352 27.5 16 27.5zm6.29-8.61c-.344-.172-2.036-1.004-2.352-1.118-.316-.115-.546-.172-.776.172-.23.344-.89 1.118-1.09 1.348-.2.23-.402.258-.746.086-.344-.172-1.452-.536-2.766-1.708-1.022-.912-1.712-2.038-1.912-2.382-.2-.344-.022-.53.15-.702.155-.154.344-.402.516-.603.172-.2.23-.344.344-.574.115-.23.058-.431-.028-.603-.086-.172-.776-1.87-1.064-2.56-.28-.672-.564-.58-.776-.59l-.66-.012c-.23 0-.603.086-.918.431-.316.344-1.204 1.176-1.204 2.868s1.232 3.326 1.404 3.556c.172.23 2.424 3.7 5.872 5.19.82.354 1.46.566 1.958.724.823.262 1.572.225 2.164.137.66-.099 2.036-.832 2.322-1.636.287-.804.287-1.492.2-1.636-.085-.143-.315-.23-.659-.402z" />
            </svg>
          </a>
        </Providers>
      </body>
    </html>
  );
}