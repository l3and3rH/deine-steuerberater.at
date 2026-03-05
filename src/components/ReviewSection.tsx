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
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reviews?profileId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews);
        setAverage(data.average);
        setCount(data.count);
      });
  }, [profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Bitte wählen Sie eine Bewertung."); return; }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, authorName, authorEmail, rating, comment: comment || undefined }),
    });

    if (res.ok) {
      const newReview = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setCount((c) => {
        setAverage((prev) => (prev * c + rating) / (c + 1));
        return c + 1;
      });
      setSuccess(true);
      setShowForm(false);
      setRating(0);
      setAuthorName("");
      setAuthorEmail("");
      setComment("");
    } else {
      setError("Fehler beim Absenden. Bitte versuchen Sie es erneut.");
    }
    setSubmitting(false);
  };

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

      {count === 0 && !showForm && (
        <p className="text-sm text-forest-400 mb-4">Noch keine Bewertungen vorhanden.</p>
      )}

      {success && (
        <p className="text-sm text-forest-600 bg-forest-50 p-3 rounded-lg mb-4">Vielen Dank für Ihre Bewertung!</p>
      )}

      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="text-sm font-medium text-forest-600 hover:text-forest-900 transition-colors mt-2">
          Bewertung schreiben
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 bg-forest-50 p-5 rounded-xl">
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1 block">Bewertung</label>
            <StarRating rating={rating} interactive onChange={setRating} />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1 block">Name</label>
            <input type="text" required value={authorName} onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1 block">E-Mail (wird nicht veröffentlicht)</label>
            <input type="email" required value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)}
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1 block">Kommentar (optional)</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="text-sm font-semibold bg-forest-900 text-cream-100 px-5 py-2 rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50">
              {submitting ? "Wird gesendet..." : "Absenden"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-sm text-forest-500 hover:text-forest-700 px-4 py-2 transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
