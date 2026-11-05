import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CAKES } from "../data/cakes";
import { useCart } from "../lib/store";

export const Route = createFileRoute("/shop")({ component: Shop });

const filters = ["All", "Signature", "Chocolate", "Fruit & Fresh", "Luxury", "Classic"] as const;

function Shop() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<(typeof CAKES)[number] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const { add } = useCart();

  const searching = search.trim().length > 0;
  const shown = useMemo(() => CAKES.filter((cake) => {
    const matchesFilter = filter === "All" || (filter === "Chocolate" ? cake.category === "Chocolate" : cake.category === filter);
    const haystack = `${cake.name} ${cake.description} ${cake.category}`.toLowerCase();
    return matchesFilter && (!searching || haystack.includes(search.trim().toLowerCase()));
  }), [filter, search, searching]);

  const addCake = (cake: (typeof CAKES)[number], amount = 1, size = cake.sizes[0] ?? "Standard") => {
    add({ slug: cake.slug, name: cake.name, image: cake.image_url, size, flavour: cake.flavours[0] ?? "Atelier selection", price: cake.price, quantity: amount });
  };

  const openCake = (cake: (typeof CAKES)[number]) => { setQuantity(1); setSelectedSize(cake.sizes[0] ?? "Standard"); setSelected(cake); };
  const categories = ["Signature", "Chocolate", "Fruit & Fresh", "Luxury", "Classic"] as const;

  return (
    <main className="min-h-screen bg-[#FFF8F0] px-4 py-12 text-[#2B2118]">
      <div className="mx-auto max-w-[1200px]">
        <header className="text-center">
          <p className="text-[11px] font-bold tracking-[0.38em] text-[#C9A86A]">THE ATELIER COLLECTION</p>
          <h1 className="mt-4 font-serif text-5xl text-[#2B2118] md:text-6xl">Shop Cakes</h1>
          <p className="mt-4 text-[#756858]">Exceptional cakes, handcrafted for life&apos;s finest celebrations.</p>
          <label className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-full border border-[#D9C39A] bg-white px-5 py-4 shadow-[0_12px_35px_rgba(92,67,35,.08)]">
            <Search size={20} className="text-[#C9A86A]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the collection..." className="w-full bg-transparent outline-none" />
          </label>
        </header>

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-5 py-2 text-xs font-bold transition ${filter === item ? "border-[#2B2118] bg-[#2B2118] text-white" : "border-[#E3D2AE] bg-white text-[#756858] hover:border-[#C9A86A]"}`}>{item}</button>)}
        </div>

        {shown.length === 0 ? (
          <div className="mt-16 rounded-[28px] border border-[#E5D7BB] bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-serif text-3xl">No cakes found for &apos;{search}&apos;</p>
            <button type="button" onClick={() => { setSearch(""); setFilter("All"); }} className="mt-6 rounded-full bg-[#2B2118] px-6 py-3 text-xs font-bold tracking-widest text-white">Clear Search</button>
          </div>
        ) : searching ? (
          <CakeGrid cakes={shown} openCake={openCake} addCake={addCake} />
        ) : (
          <div className="mt-12 space-y-14">
            {categories.map((category) => {
              const categoryCakes = shown.filter((cake) => cake.category === category);
              return categoryCakes.length ? <section key={category}><div className="mb-7 flex items-center gap-5"><h2 className="font-serif text-3xl">{category === "Chocolate" ? "Chocolate Lovers" : category}</h2><div className="h-px flex-1 bg-[#E5D7BB]" /></div><CakeGrid cakes={categoryCakes} openCake={openCake} addCake={addCake} /></section> : null;
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2118]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-auto rounded-[28px] bg-white shadow-2xl">
            <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow"><X size={20} /></button>
            <div className="grid md:grid-cols-2">
              <img src={selected.image_url} alt={selected.name} onError={(event) => { const image = event.currentTarget; if (image.src.endsWith("/images/cakes/hero.jpg")) return; image.src = "/images/cakes/hero.jpg"; }} className="h-72 w-full object-cover md:h-full" />
              <div className="p-7 md:p-10">
                {selected.badge && <span className="rounded-full bg-[#FFF1CC] px-3 py-1 text-[10px] font-bold tracking-widest text-[#80601F]">{selected.badge.toUpperCase()}</span>}
                <p className="mt-5 text-[10px] font-bold tracking-[0.2em] text-[#C9A86A]">{selected.category.toUpperCase()}</p>
                <h2 className="mt-2 font-serif text-4xl">{selected.name}</h2>
                <p className="mt-4 leading-7 text-[#756858]">{selected.description}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  {selected.flavours.map((flavour) => <span key={flavour} className="rounded-full bg-[#FFF8F0] px-3 py-1.5 text-[#756858]">{flavour}</span>)}
                </div>
                <dl className="mt-5 grid gap-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="font-bold">Sweetness</dt><dd className="text-right text-[#756858]">{selected.sweetness}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="font-bold">Cream & frosting</dt><dd className="text-right text-[#756858]">{selected.frosting}</dd></div>
                </dl>
                <strong className="mt-6 block text-2xl text-[#2B2118]">KSh {selected.price.toLocaleString("en-KE")}</strong>
                <fieldset className="mt-6">
                  <legend className="mb-3 text-sm font-bold">Cake size</legend>
                  <div className="flex flex-wrap gap-2">{selected.sizes.map((size) => <button key={size} type="button" onClick={() => setSelectedSize(size)} className={`rounded-full border px-4 py-2 text-sm font-bold ${selectedSize === size ? "border-[#2B2118] bg-[#2B2118] text-white" : "border-[#E3D2AE] bg-white text-[#756858]"}`}>{size}</button>)}</div>
                </fieldset>
                <div className="mt-7 flex items-center gap-3"><span className="text-sm font-bold">Quantity</span><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 rounded-full border">−</button><span className="w-8 text-center font-bold">{quantity}</span><button type="button" onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 rounded-full border">+</button></div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => addCake(selected, quantity, selectedSize)} className="flex items-center justify-center gap-2 rounded-full bg-[#2B2118] px-5 py-3 text-sm font-bold text-white"><ShoppingBag size={18} />Add to Cart</button>
                  <Link to="/cart" onClick={() => addCake(selected, quantity, selectedSize)} className="rounded-full bg-[#C9A86A] px-5 py-3 text-center text-sm font-bold text-white">Order Now</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function CakeGrid({ cakes, openCake, addCake }: { cakes: typeof CAKES; openCake: (cake: typeof CAKES[number]) => void; addCake: (cake: typeof CAKES[number], amount?: number) => void }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {cakes.map((cake) => (
        <article key={cake.id} className="group overflow-hidden rounded-[24px] border border-[#E5D7BB] bg-white shadow-[0_12px_40px_rgba(92,67,35,.08)] transition duration-300 hover:-translate-y-2">
          <button type="button" onClick={() => openCake(cake)} className="relative block w-full overflow-hidden">
            {cake.badge && <span className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${cake.badge === "Luxury" ? "bg-[#2B2118] text-white" : "bg-[#C9A86A] text-white"}`}>{cake.badge}</span>}
            <img src={cake.image_url} alt={cake.name} onError={(event) => { const image = event.currentTarget; if (image.src.endsWith("/images/cakes/hero.jpg")) return; image.src = "/images/cakes/hero.jpg"; }} className="h-[280px] w-full object-cover transition duration-700 group-hover:scale-105" />
          </button>
          <div className="p-6">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#C9A86A]">{cake.category.toUpperCase()}</p>
            <button type="button" onClick={() => openCake(cake)} className="mt-2 text-left font-serif text-2xl">{cake.name}</button>
            <p className="mt-2 min-h-12 text-sm leading-6 text-[#756858]">{cake.description}</p>
            <p className="mt-3 text-xs font-bold text-[#9A8060]">{cake.flavours.join(" · ")}</p>
            <p className="mt-2 text-xs text-[#756858]"><strong>Sweetness:</strong> {cake.sweetness} · {cake.frosting}</p>
            <strong className="mt-4 block text-lg">KSh {cake.price.toLocaleString("en-KE")}</strong>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => addCake(cake)} className="rounded-full bg-[#2B2118] px-3 py-3 text-xs font-bold text-white">Add to Cart</button>
              <Link to="/cart" onClick={() => addCake(cake)} className="rounded-full bg-[#C9A86A] px-3 py-3 text-center text-xs font-bold text-white">Order Now</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
