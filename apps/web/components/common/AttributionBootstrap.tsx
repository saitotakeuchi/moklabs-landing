"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

const AttributionBootstrap = () => {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
};

export default AttributionBootstrap;
