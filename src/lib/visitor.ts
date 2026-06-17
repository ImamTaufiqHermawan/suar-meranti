const VISITOR_STORAGE_KEY = "meranti_visitor_id";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(VISITOR_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_STORAGE_KEY, id);
  }
  return id;
}

export function getLikedStorageKey(): string {
  return "meranti_liked_posts";
}

export function getLocalLikedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getLikedStorageKey());
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addLocalLikedId(id: string): void {
  if (typeof window === "undefined") return;
  const current = new Set(getLocalLikedIds());
  current.add(id);
  localStorage.setItem(getLikedStorageKey(), JSON.stringify([...current]));
}

export function setLocalLikedIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getLikedStorageKey(), JSON.stringify(ids));
}
