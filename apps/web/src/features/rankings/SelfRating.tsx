import { useEffect, useState } from "react";
import type { AuthorizedFetch } from "../../shared/api.js";
import { ratingPosition, readSelfRating, type RankedRating } from "./rankings-client.js";

export function SelfRating({ authorizedFetch, guest, revision = 0 }: { authorizedFetch: AuthorizedFetch; guest: boolean; revision?: number }) {
  const [state, setState] = useState<{ fetch: AuthorizedFetch; rating: RankedRating | null; error: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (guest) return;
    let active = true;
    setState(null);
    void readSelfRating(authorizedFetch).then(
      (rating) => { if (active) setState({ fetch: authorizedFetch, rating, error: false }); },
      () => { if (active) setState({ fetch: authorizedFetch, rating: null, error: true }); },
    );
    return () => { active = false; };
  }, [authorizedFetch, guest, attempt, revision]);
  if (guest) return null;
  if (!state || state.fetch !== authorizedFetch) return <span role="status">Đang tải xếp hạng…</span>;
  if (state.error) return <span>Chưa thể tải xếp hạng. <button type="button" onClick={() => setAttempt((n) => n + 1)}>Thử lại</button></span>;
  const rating = state.rating!;
  return <span>{rating.elo} Elo · {rating.completed > 0 ? `${rating.tier} · ` : ""}{ratingPosition(rating)}</span>;
}
