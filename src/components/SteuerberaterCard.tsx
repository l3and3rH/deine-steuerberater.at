import Image from "next/image";
import { Paket } from "@prisma/client";

interface Props {
  name: string;
  adresse?: string | null;
  telefon?: string | null;
  website?: string | null;
  logo?: string | null;
  beschreibung?: string | null;
  tags: string[];
  paket: Paket;
  slug: string;
  stadtSlug: string;
}

export default function SteuerberaterCard(props: Props) {
  const { name, adresse, telefon, website, logo, beschreibung, tags, paket, slug, stadtSlug } = props;
  const isPremium = paket === "GOLD" || paket === "SEO";

  return (
    <div className={`bg-white rounded-lg border p-5 flex gap-4 ${isPremium ? "border-blue-400 shadow-md" : "border-gray-200"}`}>
      {logo && (
        <Image src={logo} alt={name} width={64} height={64} className="rounded object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <a href={`/steuerberater/${stadtSlug}/${slug}`} className="font-semibold text-gray-900 hover:text-blue-600 text-lg">
            {name}
          </a>
          {isPremium && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Premium</span>
          )}
        </div>
        {adresse && <p className="text-sm text-gray-500 mb-1">{adresse}</p>}
        {beschreibung && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{beschreibung}</p>}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex gap-4 text-sm">
          {telefon && <a href={`tel:${telefon}`} className="text-blue-600 hover:underline">{telefon}</a>}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs">
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
