'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#182375', marginBottom: '2rem' }}>
              Sure Filter&reg;
            </p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              Something went wrong
            </h1>
            <p style={{ marginTop: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}>
              A critical error occurred. Please try again or return to the homepage.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#fff', backgroundColor: '#f97316', border: 'none', cursor: 'pointer' }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151', border: '1px solid #e5e7eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Back to Homepage
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
