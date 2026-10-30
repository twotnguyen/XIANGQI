/** Biểu tượng nét dùng chung cho điều hướng và các thao tác trên Sảnh. */
export function AppIcon({
  name,
  className = "",
}: {
  name:
    | "lobby"
    | "friends"
    | "profile"
    | "history"
    | "trophy"
    | "book"
    | "arrow"
    | "plus"
    | "key"
    | "clock"
    | "logout"
    | "menu";
  className?: string;
}) {
  const paths = {
    lobby: "M3 10 12 3l9 7M5 9v11h14V9M9 20v-7h6v7",
    friends:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3a4 4 0 0 1 0 8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    profile: "M20 21v-2a7 7 0 0 0-14 0v2M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    history: "M3 11a9 9 0 1 1 2.7 7M3 4v7h7m2-4v5l3 2",
    trophy:
      "M8 3h8v5a4 4 0 0 1-8 0V3m0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v6m-4 3h8m-8 0v-3h8v3",
    book: "M12 5v16m0-16C9 3 5 3 2 4v15c3-1 7-1 10 2m0-16c3-2 7-2 10-1v15c-3-1-7-1-10 2",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    plus: "M12 5v14M5 12h14",
    key: "M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m-4 4v10m0-4h4m-4 4h3",
    clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2",
    logout: "M9 4H4v16h5m5-12 4 4-4 4m-5-4h13",
    menu: "M4 6h16M4 12h16M4 18h16",
  };
  return (
    <svg
      className={"xq-icon " + className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
