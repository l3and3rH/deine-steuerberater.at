interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function MapEmbed({ lat, lng, name }: Props) {
  const bbox = `${lng - 0.01},${lat - 0.007},${lng + 0.01},${lat + 0.007}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="rounded-lg overflow-hidden border border-forest-100">
      <iframe
        title={`Karte: ${name}`}
        src={src}
        width="100%"
        height="250"
        className="border-0"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-forest-500 hover:text-forest-700 py-2 bg-forest-50 transition-colors"
      >
        Größere Karte anzeigen
      </a>
    </div>
  );
}
