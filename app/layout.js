import './globals.css';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';

export const metadata = {
  title: 'MyTower - Society Management System',
  description: 'Comprehensive society management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
