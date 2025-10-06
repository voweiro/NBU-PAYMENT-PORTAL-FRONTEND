'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <Provider store={store}>
      {/* Mount toasts globally for public pages; admin layout has its own container */}
      {!isAdmin && <ToastContainer position="top-right" autoClose={3000} theme="light" />}
      {children}
    </Provider>
  );
}