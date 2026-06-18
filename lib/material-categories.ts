export const MATERIAL_CATEGORIES = [
  { label: "Flooring",           color: "bg-amber-100 text-amber-800" },
  { label: "Wall Finish",        color: "bg-orange-100 text-orange-800" },
  { label: "Ceiling",            color: "bg-sky-100 text-sky-800" },
  { label: "Tiles & Stone",      color: "bg-stone-100 text-stone-800" },
  { label: "Paint & Texture",    color: "bg-yellow-100 text-yellow-800" },
  { label: "Lighting",           color: "bg-purple-100 text-purple-800" },
  { label: "Electrical",         color: "bg-violet-100 text-violet-800" },
  { label: "Furniture",          color: "bg-teal-100 text-teal-800" },
  { label: "Soft Furnishings",   color: "bg-pink-100 text-pink-800" },
  { label: "Sanitary Ware",      color: "bg-cyan-100 text-cyan-800" },
  { label: "Plumbing Fittings",  color: "bg-blue-100 text-blue-800" },
  { label: "Doors & Windows",    color: "bg-lime-100 text-lime-800" },
  { label: "Ironmongery",        color: "bg-zinc-100 text-zinc-800" },
  { label: "Kitchen Fittings",   color: "bg-rose-100 text-rose-800" },
  { label: "Structural",         color: "bg-red-100 text-red-800" },
  { label: "Landscaping",        color: "bg-green-100 text-green-800" },
  { label: "Other",              color: "bg-gray-100 text-gray-700" },
] as const;

export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number]["label"];

export function getCategoryColor(category: string): string {
  return MATERIAL_CATEGORIES.find(c => c.label === category)?.color ?? "bg-gray-100 text-gray-700";
}
