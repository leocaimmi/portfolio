'use client';

/**
 * Last-resort boundary for failures in the root layout itself.
 *
 * It replaces the whole document, so it has to supply `<html>` and `<body>`,
 * and it cannot rely on anything the layout provides — including the
 * translation context. The copy is therefore fixed English, and the styling is
 * inline: the stylesheet is one of the things that may have failed to load.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          padding: '2rem',
          backgroundColor: '#02030a',
          color: '#e9edff',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Something went wrong</h1>

        <p style={{ margin: 0, maxWidth: '32rem', lineHeight: 1.6, color: '#a7b1d4' }}>
          The page could not be rendered. Try again, and if it keeps happening please get in touch.
        </p>

        <button
          type="button"
          onClick={reset}
          style={{
            padding: '0.7rem 1.4rem',
            borderRadius: '9999px',
            border: 'none',
            backgroundColor: '#e9edff',
            color: '#02030a',
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>

        {error.digest ? (
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#6c779c' }}>REF {error.digest}</p>
        ) : null}
      </body>
    </html>
  );
}
