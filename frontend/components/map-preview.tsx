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
  zoom,
  width = "100%",
  height = "100%",
  className,
}) => {
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude}%2C${latitude}&layer=mapnik&marker=${latitude}%2C${longitude}&zoom=${zoom}`;

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
