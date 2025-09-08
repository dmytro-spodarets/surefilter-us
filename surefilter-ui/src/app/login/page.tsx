import LoginForm from './LoginForm';
import { Suspense } from 'react';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<div>Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}


