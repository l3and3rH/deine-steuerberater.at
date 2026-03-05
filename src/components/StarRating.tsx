"use client";

interface Props {
  rating: number;
  max?: number;
  size?: "xs" | "sm" | "md";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeClasses = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-5 h-5" } as const;

export default function StarRating({ rating, max = 5, size = "md", interactive = false, onChange }: Props) {
  const sizeClass = sizeClasses[size];

  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} von ${max} Sternen`}>
      {Array.from({ length: max }, (_, i) => {
        const star = (
          <svg
            className={`${sizeClass} ${i < Math.round(rating) ? "text-gold-500" : "text-forest-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );

        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange?.(i + 1)}
              className="cursor-pointer hover:scale-110 transition-transform"
              aria-label={`${i + 1} Sterne`}
            >
              {star}
            </button>
          );
        }

        return <span key={i}>{star}</span>;
      })}
    </div>
  );
}
