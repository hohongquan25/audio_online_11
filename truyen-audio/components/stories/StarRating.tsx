"use client";

import { useState, useCallback } from "react";
import Modal from "@/components/ui/Modal";

interface StarRatingProps {
  storyId: string;
  currentRating: number | null;
  avgRating: number;
  ratingCount: number;
  isLoggedIn: boolean;
}

export default function StarRating({
  storyId,
  currentRating,
  avgRating: initialAvgRating,
  ratingCount: initialRatingCount,
  isLoggedIn,
}: StarRatingProps) {
  const [userRating, setUserRating] = useState<number | null>(currentRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState(initialAvgRating);
  const [ratingCount, setRatingCount] = useState(initialRatingCount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleRate = useCallback(
    async (score: number) => {
      if (!isLoggedIn) {
        setShowLoginModal(true);
        return;
      }

      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const res = await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyId, score }),
        });

        if (res.ok) {
          const data = await res.json();
          setUserRating(data.userScore);
          setAvgRating(data.avgRating);
          setRatingCount(data.ratingCount);
        }
      } catch {
        // Silently fail — user can retry
      } finally {
        setIsSubmitting(false);
      }
    },
    [isLoggedIn, isSubmitting, storyId]
  );

  const displayRating = hoverRating || userRating || 0;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        {/* Interactive stars */}
        <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Đánh giá truyện">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={userRating === star}
              aria-label={`${star} sao`}
              disabled={isSubmitting}
              className="p-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded disabled:opacity-50 cursor-pointer"
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <svg
                className={`h-6 w-6 transition-colors ${
                  star <= displayRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
              </svg>
            </button>
          ))}
        </div>

        {/* Rating info */}
        <div className="text-sm text-gray-500">
          {ratingCount > 0 ? (
            <span>
              <span className="font-medium text-yellow-600">{avgRating.toFixed(1)}</span>
              {" / 5 "}
              <span className="text-gray-400">({ratingCount} đánh giá)</span>
            </span>
          ) : (
            <span className="text-gray-400">Chưa có đánh giá</span>
          )}
        </div>
      </div>

      {userRating && (
        <p className="mt-1 text-xs text-gray-400">
          Bạn đã đánh giá {userRating} sao
        </p>
      )}

      {/* Login modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Yêu cầu đăng nhập"
      >
        <p className="mb-4 text-gray-600">
          Vui lòng đăng nhập để đánh giá truyện.
        </p>
        <div className="flex gap-3">
          <a
            href="/login"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Đăng nhập
          </a>
          <button
            onClick={() => setShowLoginModal(false)}
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </Modal>
    </div>
  );
}
