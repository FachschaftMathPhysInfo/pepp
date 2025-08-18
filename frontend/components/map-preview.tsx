import React from "react";

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: string;
  height?: string;
  className?: string;
}

const MapPreview: React.FC<MapPreviewProps> = ({
  latitude,
  longitude,
  zoom = 17,
  width = "100%",
  height = "100%",
  className,
}) => {
  const delta = 0.0005;
  const minLon = longitude - delta;
  const minLat = latitude - delta;
  const maxLon = longitude + delta;
  const maxLat = latitude + delta;
  
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${latitude}%2C${longitude}&zoom=${zoom}`;
  
  return (
    <div className="flex justify-center">
      <iframe
        width={width}
        height={height}
        src={mapSrc}
        className={className}
        allowFullScreen
      />
    </div>
  );
};

export default MapPreview;
