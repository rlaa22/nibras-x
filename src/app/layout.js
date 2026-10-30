import './globals.css';

export const metadata = {
  title: 'NIBRAS X | مبنى 12',
  description: 'بوابة الواقع المعزز لمبنى 12 - كلية الحاسبات وتقنية المعلومات بجامعة الطائف'
};

export default function RootLayout({ children }) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
