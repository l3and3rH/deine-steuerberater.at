"use client";
import { useState, useEffect } from "react";
import StarRating from "./StarRating";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface Props {
  profileId: string;
}

export default function ReviewSection({ profileId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`/api/reviews?profileId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews);
        setAverage(data.average);
        setCount(data.count);
      });
  }, [profileId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-forest-400">
          Bewertungen {count > 0 && `(${count})`}
        </h2>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={average} size="sm" />
            <span className="text-sm font-semibold text-forest-700">{average.toFixed(1)}</span>
          </div>
        )}
      </div>

      {reviews.map((review) => (
        <div key={review.id} className="border-b border-forest-100 py-4 last:border-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-medium text-forest-800 text-sm">{review.authorName}</span>
            <StarRating rating={review.rating} size="sm" />
          </div>
          {review.comment && <p className="text-sm text-forest-600 mt-1">{review.comment}</p>}
          <p className="text-xs text-forest-400 mt-1">
            {new Date(review.createdAt).toLocaleDateString("de-AT")}
          </p>
        </div>
      ))}

      {count === 0 && (
        <p className="text-sm text-forest-400">Noch keine Bewertungen vorhanden.</p>
      )}
    </div>
  );
}
