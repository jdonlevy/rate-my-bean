"use client";

import dynamic from "next/dynamic";

const RegionLeafletMap = dynamic(() => import("@/components/RegionLeafletMap"), {
  ssr: false,
});

export default function HomeMap({ pins }) {
  return (
    <div className="map-frame">
      <RegionLeafletMap pins={pins} />
    </div>
  );
}
