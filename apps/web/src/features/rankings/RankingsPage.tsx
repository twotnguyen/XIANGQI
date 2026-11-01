import { useEffect, useState } from "react";
import { Button, Dialog, Skeleton } from "../../shared/ui/primitives.js";
import type { AuthorizedFetch } from "../../shared/api.js";
import { ratingPosition, readRankings, type LeaderboardPlayer, type LeaderboardView } from "./rankings-client.js";
import "./rankings.css";

export function RankingsPage({ authorizedFetch, guest, onMessage }: { authorizedFetch: AuthorizedFetch; guest: boolean; onMessage: (userId: string) => void }) {
  const [state, setState] = useState<{ fetch: AuthorizedFetch; view: LeaderboardView | null; error: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<LeaderboardPlayer | null>(null);
  useEffect(() => {
    if (guest) return;
    let active = true;
    setState(null);
    setSelected(null);
    void readRankings(authorizedFetch).then(
      (view) => { if (active) setState({ fetch: authorizedFetch, view, error: false }); },
      () => { if (active) setState({ fetch: authorizedFetch, view: null, error: true }); },
    );
    return () => { active = false; };
  }, [authorizedFetch, guest, attempt]);
  const current = state?.fetch === authorizedFetch ? state : null;
  const view = guest ? null : current?.view;
  const refresh = () => setAttempt((n) => n + 1);
  const row = (player: LeaderboardPlayer, own = false) => <li key={player.userId} className="xq-ranking-row">
    <span>{ratingPosition(player.rating)}</span>
    <button type="button" onClick={() => setSelected(player)}>{player.displayName}{own ? " (Bạn)" : ""}</button>
    <span>{player.rating.elo} Elo · {player.rating.tier}</span>
    <span>Thắng {player.rating.wins} / Hòa {player.rating.draws} / Thua {player.rating.losses} · {player.rating.completed ? Math.round(player.rating.wins / player.rating.completed * 100) : 0}% thắng</span>
  </li>;
  return <main className="xq-ui xq-rankings">
    <header><h1>Bảng xếp hạng</h1><p>Top 50 kỳ thủ Đánh Hạng</p></header>
    {guest ? <p>Khách không thể xem bảng xếp hạng. Hãy đăng nhập để xem.</p> : <>
      <Button variant="secondary" onClick={refresh} disabled={!current}>Làm mới</Button>
      {!current && <Skeleton label="Đang tải bảng xếp hạng…" />}
      {current?.error && <div><p role="alert">Chưa thể tải bảng xếp hạng.</p><Button onClick={refresh}>Thử lại</Button></div>}
      {view && <>
        {view.demo && <p>Chế độ demo: cần {view.minimumGames} ván để xếp hạng.</p>}
        {view.players.length === 0 ? <p>Chưa có người chơi đủ điều kiện xếp hạng.</p> : <ol className="xq-rankings-list">{view.players.map((p) => row(p))}</ol>}
        <h2>Xếp hạng của bạn</h2><ul className="xq-rankings-list">{row(view.self, true)}</ul>
      </>}
    </>}
    <Dialog open={!!selected && !guest && !!view} onClose={() => setSelected(null)} title="Thông tin kỳ thủ" cancelLabel="Đóng">
      {selected && <div className="xq-ranking-summary">
        {selected.avatarUrl ? <img src={selected.avatarUrl} alt="" /> : <span aria-hidden="true" className="xq-ranking-avatar">{Array.from(selected.displayName.trim())[0]?.toUpperCase() || "?"}</span>}
        <strong>{selected.displayName}</strong><span>@{selected.username}</span>
        <span>{selected.rating.elo} Elo · {selected.rating.tier}</span>
        <span>Thắng {selected.rating.wins} / Hòa {selected.rating.draws} / Thua {selected.rating.losses}</span>
        {selected.canMessage && selected.userId !== view?.self.userId && <Button onClick={() => { onMessage(selected.userId); setSelected(null); }}>Nhắn tin</Button>}
      </div>}
    </Dialog>
  </main>;
}
