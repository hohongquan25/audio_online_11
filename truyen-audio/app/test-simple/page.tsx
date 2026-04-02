export default function TestSimplePage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#0f0f23', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>Simple Test - No React Hooks</h1>
      
      <a 
        href="/"
        style={{
          display: 'block',
          padding: '20px',
          backgroundColor: '#1a1a2e',
          color: 'white',
          textDecoration: 'none',
          marginBottom: '20px',
          borderRadius: '8px'
        }}
      >
        Link Test - Tap to go home
      </a>

      <a 
        href="#"
        onClick={(e) => {
          e.preventDefault();
          alert('Link with onClick works!');
        }}
        style={{
          display: 'block',
          padding: '20px',
          backgroundColor: '#2a2a4a',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px'
        }}
      >
        Link with onClick - Tap me
      </a>
    </div>
  );
}
