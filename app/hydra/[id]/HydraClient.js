'use client';

import dynamic from "next/dynamic";

// HydraSynth touches the canvas/WebGL APIs, so it must stay client-only.
const HydraSynth = dynamic(() => import("@/components/hydra-view"), {
  ssr: false,
});

export default function HydraClient({ source }) {
  return <HydraSynth source={source} />;
}
