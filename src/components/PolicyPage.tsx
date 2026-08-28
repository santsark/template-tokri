export function PolicyPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F1E3', fontFamily: 'Poppins, sans-serif', padding: '40px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <a href="/" style={{ color: '#1E2B3C', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>&larr; Back to Template Tokri</a>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, color: '#1E2B3C', marginBottom: 20 }}>{title}</h1>
        <div style={{ color: '#232B26', fontSize: 14.5, lineHeight: 1.7 }}>{children}</div>
      </div>
    </div>
  );
}