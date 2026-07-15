import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-500">
      <Search className="h-4 w-4" />
      <input
        placeholder="Pesquisar..."
        className="w-72 border-none bg-transparent outline-none"
      />
    </label>
  );
}
