"use client";

import { useEffect } from "react";
import { incrementViewCount } from "@/app/actions/favorites";

export default function StoryViewTracker({ storyId }: { storyId: string }) {
  useEffect(() => {
    incrementViewCount(storyId);
  }, [storyId]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
