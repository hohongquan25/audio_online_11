"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Link from "next/link";

export default function MobileTestPage() {
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastAction, setLastAction] = useState("");

  function handleAction(action: string) {
    setLastAction(action);
    setClickCount(prev => prev + 1);
    console.log(`[Mobile Test] Action: ${action}`);
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-purple-600/30 bg-purple-900/10 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">🧪 Mobile Touch Test</h1>
          <p className="mt-2 text-sm text-gray-400">Test tất cả các loại buttons và actions</p>
          <div className="mt-4 rounded-lg bg-[#1a1a2e] p-3">
            <p className="text-sm text-gray-300">
              Clicks: <span className="font-bold text-purple-400">{clickCount}</span>
            </p>
            {lastAction && (
              <p className="mt-1 text-xs text-green-400">
                ✓ Last action: {lastAction}
              </p>
            )}
          </div>
        </div>

        {/* Section 1: Basic Buttons */}
        <div className="rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">1. Basic Buttons</h2>
          <div className="space-y-3">
            <button
              onClick={() => handleAction("Primary Button")}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
              className="w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700 active:bg-purple-800"
            >
              Primary Button
            </button>
            
            <button
              onClick={() => handleAction("Secondary Button")}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
              className="w-full rounded-xl border border-[#2a2a4a] bg-[#2a2a4a] py-3 text-sm font-semibold text-white hover:bg-purple-600"
            >
              Secondary Button
            </button>
            
            <button
              onClick={() => handleAction("Outline Button")}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
              className="w-full rounded-xl border border-purple-600 py-3 text-sm font-semibold text-purple-400 hover:bg-purple-600/10"
            >
              Outline Button
            </button>
          </div>
        </div>

        {/* Section 2: Modal Triggers */}
        <div className="rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">2. Modal Triggers</h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                handleAction("Open Modal 1");
                setShowModal1(true);
              }}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Open Modal 1
            </button>
            
            <button
              onClick={() => {
                handleAction("Open Modal 2");
                setShowModal2(true);
              }}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
              className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Open Modal 2
            </button>
            
            <button
              onClick={() => {
                handleAction("Open Modal 3");
                setShowModal3(true);
              }}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
              className="w-full rounded-xl bg-yellow-600 py-3 text-sm font-semibold text-white hover:bg-yellow-700"
            >
              Open Modal 3
            </button>
          </div>
        </div>

        {/* Section 3: Links */}
        <div className="rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">3. Navigation Links</h2>
          <div className="space-y-3">
            <Link
              href="/"
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
              className="flex items-center justify-center rounded-xl border border-[#2a2a4a] py-3 text-sm font-medium text-gray-300 hover:bg-[#1a1a2e] hover:text-white"
            >
              Go to Home
            </Link>
            
            <Link
              href="/stories"
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
              className="flex items-center justify-center rounded-xl border border-[#2a2a4a] py-3 text-sm font-medium text-gray-300 hover:bg-[#1a1a2e] hover:text-white"
            >
              Go to Stories
            </Link>
            
            <Link
              href="/vip"
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
              className="flex items-center justify-center rounded-xl bg-yellow-500 py-3 text-sm font-semibold text-white hover:bg-yellow-600"
            >
              Go to VIP Page
            </Link>
          </div>
        </div>

        {/* Section 4: Small Buttons */}
        <div className="rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">4. Small Icon Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAction("Play Icon")}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minWidth: '48px', minHeight: '48px' }}
              className="flex items-center justify-center rounded-full bg-purple-600 p-3 text-white hover:bg-purple-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            
            <button
              onClick={() => handleAction("Heart Icon")}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minWidth: '48px', minHeight: '48px' }}
              className="flex items-center justify-center rounded-full bg-red-600 p-3 text-white hover:bg-red-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
            
            <button
              onClick={() => handleAction("Share Icon")}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minWidth: '48px', minHeight: '48px' }}
              className="flex items-center justify-center rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            
            <button
              onClick={() => handleAction("Menu Icon")}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minWidth: '48px', minHeight: '48px' }}
              className="flex items-center justify-center rounded-full bg-gray-600 p-3 text-white hover:bg-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Section 5: List Items */}
        <div className="rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">5. Clickable List Items</h2>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <button
                key={item}
                onClick={() => handleAction(`List Item ${item}`)}
                style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '56px' }}
                className="flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left hover:border-purple-600/30 hover:bg-purple-600/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20">
                  <span className="text-lg">🎧</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Episode {item}</p>
                  <p className="text-xs text-gray-500">Tap to play</p>
                </div>
                <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Section 6: Form Buttons */}
        <div className="rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">6. Form Submit Buttons</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("Form Submitted");
            }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Enter something..."
              className="w-full rounded-lg border border-[#2a2a4a] bg-[#0f0f23] px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
              className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Submit Form
            </button>
          </form>
        </div>

        {/* Section 7: Disabled State */}
        <div className="rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">7. Disabled Button (Should NOT work)</h2>
          <button
            disabled
            style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
            className="w-full rounded-xl bg-gray-600 py-3 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
          >
            Disabled Button
          </button>
        </div>

        {/* Back to Home */}
        <div className="pb-8 pt-4">
          <Link
            href="/"
            style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
            className="flex items-center justify-center rounded-xl border border-[#2a2a4a] py-3 text-sm font-medium text-gray-400 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showModal1} onClose={() => setShowModal1(false)} title="Modal 1">
        <p className="mb-4 text-sm text-gray-400">
          This is Modal 1. You successfully opened it!
        </p>
        <button
          onClick={() => {
            handleAction("Modal 1 Action");
            setShowModal1(false);
          }}
          style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
          className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          Close Modal 1
        </button>
      </Modal>

      <Modal isOpen={showModal2} onClose={() => setShowModal2(false)} title="Modal 2">
        <p className="mb-4 text-sm text-gray-400">
          This is Modal 2 with multiple buttons.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => handleAction("Modal 2 - Button 1")}
            style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Action 1
          </button>
          <button
            onClick={() => handleAction("Modal 2 - Button 2")}
            style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Action 2
          </button>
          <button
            onClick={() => setShowModal2(false)}
            style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
            className="w-full rounded-lg border border-[#2a2a4a] px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </Modal>

      <Modal isOpen={showModal3} onClose={() => setShowModal3(false)} title="Modal 3 - Confirmation">
        <p className="mb-4 text-sm text-gray-400">
          Are you sure you want to perform this action?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              handleAction("Modal 3 - Confirmed");
              setShowModal3(false);
            }}
            style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Confirm
          </button>
          <button
            onClick={() => setShowModal3(false)}
            style={{ touchAction: 'manipulation', pointerEvents: 'auto', minHeight: '48px' }}
            className="flex-1 rounded-lg border border-[#2a2a4a] px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
