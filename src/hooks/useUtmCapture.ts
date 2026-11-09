"use client";

import { useEffect, useState } from "react";
import { captureSessionUtm, createEmptyUtm } from "@/lib/utm";
import type { UtmParams } from "@/types/registration";

export function useUtmCapture(): UtmParams {
  const [utm, setUtm] = useState<UtmParams>(createEmptyUtm);

  useEffect(() => {
    setUtm(captureSessionUtm());
  }, []);

  return utm;
}

