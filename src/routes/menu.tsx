import { createFileRoute } from "@tanstack/react-router";
import { CAKES } from "../data/cakes";

export const Route = createFileRoute("/menu")({ component: MenuPage });

function MenuPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F0] px-4 py-14 text-[#2B2118]">
      <div className="mx-auto max-w-[1000px]">
        <header className="text-center">
          <p className="text-[11px] font-bold tracking-[0.38em] text-[#C9A86A]">THE COMPLETE COLLECTION</p>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">Atelier Menu</h1>
          <p className="mt-4 text-[#756858]">Cakes, pastries and breads prepared fresh at Sweet Serenity.</p>
        </header>
        <section className="mt-12 overflow-hidden rounded-[28px] border border-[#E5D7BB] bg-white shadow-[0_18px_60px_rgba(92,67,35,.08)]">
          {CAKES.map((cake) => <div key={cake.id} className="grid gap-2 border-b border-[#F0E6D4] px-6 py-5 last:border-b-0 md:grid-cols-[1fr_auto] md:px-8"><div><h2 className="font-serif text-xl">{cake.name}</h2><p className="mt-1 text-sm text-[#756858]">{cake.description}</p></div><strong className="md:self-center">KSh {cake.price.toLocaleString("en-KE")}</strong></div>)}
        </section>
        <section className="mt-8 grid gap-5 md:grid-cols-3">{["Fresh Pastries", "Butter Croissants", "Artisan Breads"].map((item) => <div key={item} className="rounded-[22px] border border-[#E5D7BB] bg-white p-6 text-center shadow-sm"><h2 className="font-serif text-2xl">{item}</h2><p className="mt-2 text-sm text-[#756858]">Available for daily atelier collection.</p></div>)}</section>
      </div>
    </main>
  );
}
