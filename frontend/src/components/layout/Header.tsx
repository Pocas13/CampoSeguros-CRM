export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">

      <input
        placeholder="Pesquisar cliente, apólice, matrícula..."
        className="w-[500px] rounded-lg border px-4 py-2"
      />

      <div className="flex items-center gap-3">

        <div className="text-right">

          <div className="font-semibold">

            Daniel Campos

          </div>

          <div className="text-sm text-slate-500">

            Mediador

          </div>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">

          D

        </div>

      </div>

    </header>
  );
}