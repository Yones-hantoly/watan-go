const FAVORITES_KEY = "watan_go_favorite_restaurants";

export function getFavoriteRestaurantSlugs(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveFavoriteRestaurantSlugs(slugs: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(slugs));
}

export function isFavoriteRestaurant(slug: string) {
  return getFavoriteRestaurantSlugs().includes(slug);
}

export function toggleFavoriteRestaurant(slug: string) {
  const favorites = getFavoriteRestaurantSlugs();
  const exists = favorites.includes(slug);

  if (exists) {
    const nextFavorites = favorites.filter((item) => item !== slug);
    saveFavoriteRestaurantSlugs(nextFavorites);
    return { active: false as const, favorites: nextFavorites };
  }

  const nextFavorites = [...favorites, slug];
  saveFavoriteRestaurantSlugs(nextFavorites);
  return { active: true as const, favorites: nextFavorites };
}
