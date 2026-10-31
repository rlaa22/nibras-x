'use client';

export default function Error({ error, reset }) {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#080e1d',
      color: 'white',
      padding: '30px',
      direction: 'rtl',
      textAlign: 'center'
    }}>
      <h2>حدث خطأ في NIBRAS X</h2>

      <p style={{ color: '#ff9caa' }}>
        {error?.message || 'خطأ غير معروف'}
      </p>

      <button
        onClick={() => reset()}
        style={{
          padding: '12px 25px',
          borderRadius: '10px',
          marginTop: '20px'
        }}
      >
        إعادة المحاولة
      </button>
    </main>
  );
}
