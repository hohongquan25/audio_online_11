"use client";

import { useState } from "react";

export default function TestMobilePage() {
  const [clicks, setClicks] = useState(0);
  const [touches, setTouches] = useState(0);

  return (
    <div className="min-h-screen bg-[#0f0f23] p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Mobile Touch Test</h1>
      
      <div className="space-y-6">
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <p className="text-white mb-2">Clicks: {clicks}</p>
          <p className="text-white mb-4">Touches: {touches}</p>
          
          <button
            onClick={() => {
              console.log('onClick triggered');
              setClicks(c => c + 1);
            }}
            onTouchStart={() => {
              console.log('onTouchStart triggered');
              setTouches(t => t + 1);
            }}
            className="w-full bg-purple-600 text-white px-6 py-4 rounded-lg text-lg font-medium"
            style={{
              WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.3)',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              minHeight: '60px',
              position: 'relative',
              zIndex: 10
            }}
          >
            Tap Me!
          </button>
        </div>

        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <p className="text-gray-400 text-sm">
            Nếu button trên hoạt động, vấn đề là ở components cụ thể.
            <br />
            Nếu button trên KHÔNG hoạt động, vấn đề là global (CSS hoặc JS error).
          </p>
        </div>

        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <a 
            href="/"
            className="block w-full bg-green-600 text-white px-6 py-4 rounded-lg text-lg font-medium text-center"
          >
            Back to Home (Link Test)
          </a>
        </div>
      </div>
    </div>
  );
}
