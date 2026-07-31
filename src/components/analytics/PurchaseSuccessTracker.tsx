"use client";

import { trackPurchase } from "@/lib/analytics";
import { useEffect } from "react";

export function PurchaseSuccessTracker({ sessionId }: { sessionId?: string }) {
  useEffect(() => {
    if (sessionId) trackPurchase(sessionId);
  }, [sessionId]);

  return null;
}
