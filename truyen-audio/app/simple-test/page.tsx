"use client";

import { useState } from "react";

export default function SimpleTestPage() {
  const [count, setCount] = useState(0);
  const [lastClick, setLastClick] = useState("");

  function handleClick(name: string) {
    setCount(c => c + 1);
    setLastClick(name);
    console.log(`Clicked: ${name}`);
    alert(`Button clicked: ${name}`);
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f0f23', 
      padding: '20px',
      pointerEvents: 'auto'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        pointerEvents: 'auto'
      }}>
        <h1 style={{ color: 'white', marginBottom: '20px' }}>Simple Touch Test</h1>
        
        <div style={{ 
          background: '#1a1a2e', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '20px',
          color: 'white',
          pointerEvents: 'auto'
        }}>
          <p>Clicks: {count}</p>
          <p>Last: {lastClick}</p>
        </div>

        <button
          onClick={() => handleClick('Button 1')}
          style={{
            width: '100%',
            padding: '20px',
            marginBottom: '10px',
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            touchAction: 'manipulation',
            pointerEvents: 'auto',
            minHeight: '60px',
            position: 'relative',
            zIndex: 9999
          }}
        >
          Button 1 - Tap Me!
        </button>

        <button
          onClick={() => handleClick('Button 2')}
          style={{
            width: '100%',
            padding: '20px',
            marginBottom: '10px',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            touchAction: 'manipulation',
            pointerEvents: 'auto',
            minHeight: '60px',
            position: 'relative',
            zIndex: 9999
          }}
        >
          Button 2 - Tap Me!
        </button>

        <button
          onClick={() => handleClick('Button 3')}
          style={{
            width: '100%',
            padding: '20px',
            marginBottom: '10px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            touchAction: 'manipulation',
            pointerEvents: 'auto',
            minHeight: '60px',
            position: 'relative',
            zIndex: 9999
          }}
        >
          Button 3 - Tap Me!
        </button>

        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          background: '#1a1a2e', 
          borderRadius: '10px',
          color: '#9ca3af',
          fontSize: '14px',
          pointerEvents: 'auto'
        }}>
          <p><strong style={{ color: 'white' }}>Instructions:</strong></p>
          <p>1. Tap each button</p>
          <p>2. Check if counter increases</p>
          <p>3. Check if alert appears</p>
          <p>4. Check console logs</p>
        </div>
      </div>
    </div>
  );
}
