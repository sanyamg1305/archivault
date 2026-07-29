export const MATERIAL_CATEGORIES = [
  // User's specific categories
  { label: "Lights Fixtures",    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/35 dark:text-purple-300" },
  { label: "Loose Furnitures",   color: "bg-teal-100 text-teal-800 dark:bg-teal-900/35 dark:text-teal-300" },
  { label: "Ceiling Work",       color: "bg-sky-100 text-sky-800 dark:bg-sky-900/35 dark:text-sky-300" },
  { label: "Flooring Work",      color: "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300" },
  { label: "MEP Services",       color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/35 dark:text-indigo-300" },
  { label: "HVAC Services",      color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/35 dark:text-cyan-300" },
  { label: "Carpentry Work",     color: "bg-orange-100 text-orange-800 dark:bg-orange-900/35 dark:text-orange-300" },
  { label: "Civil Work",         color: "bg-stone-100 text-stone-800 dark:bg-stone-900/35 dark:text-stone-300" },
  { label: "Lift Services",      color: "bg-rose-100 text-rose-800 dark:bg-rose-900/35 dark:text-rose-300" },

  // Default fallbacks and pre-existing
  { label: "Flooring",           color: "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300" },
  { label: "Wall Finish",        color: "bg-orange-100 text-orange-800 dark:bg-orange-900/35 dark:text-orange-300" },
  { label: "Ceiling",            color: "bg-sky-100 text-sky-800 dark:bg-sky-900/35 dark:text-sky-300" },
  { label: "Tiles & Stone",      color: "bg-stone-100 text-stone-800 dark:bg-stone-900/35 dark:text-stone-300" },
  { label: "Paint & Texture",    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/35 dark:text-yellow-300" },
  { label: "Lighting",           color: "bg-purple-100 text-purple-800 dark:bg-purple-900/35 dark:text-purple-300" },
  { label: "Electrical",         color: "bg-violet-100 text-violet-800 dark:bg-violet-900/35 dark:text-violet-300" },
  { label: "Furniture",          color: "bg-teal-100 text-teal-800 dark:bg-teal-900/35 dark:text-teal-300" },
  { label: "Soft Furnishings",   color: "bg-pink-100 text-pink-800 dark:bg-pink-900/35 dark:text-pink-300" },
  { label: "Sanitary Ware",      color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/35 dark:text-cyan-300" },
  { label: "Plumbing Fittings",  color: "bg-blue-100 text-blue-800 dark:bg-blue-900/35 dark:text-blue-300" },
  { label: "Doors & Windows",    color: "bg-lime-100 text-lime-800 dark:bg-lime-900/35 dark:text-lime-300" },
  { label: "Ironmongery",        color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/35 dark:text-zinc-300" },
  { label: "Kitchen Fittings",   color: "bg-rose-100 text-rose-800 dark:bg-rose-900/35 dark:text-rose-300" },
  { label: "Structural",         color: "bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-300" },
  { label: "Landscaping",        color: "bg-green-100 text-green-800 dark:bg-green-900/35 dark:text-green-300" },
  { label: "Other",              color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
] as const;

export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number]["label"];

export function getCategoryColor(category: string): string {
  return MATERIAL_CATEGORIES.find(c => c.label === category)?.color ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}
