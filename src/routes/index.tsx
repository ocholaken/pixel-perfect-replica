import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CAKES } from "../data/cakes";
import { useCart } from "../lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [start, setStart] = useState(0);
  const [fade, setFade] = useState(false);
  const transitionTimer = useRef<number | null>(null);
  const [direction, setDirection] = useState(1);
  const { add } = useCart();
  const locationHash = useRouterState({ select: (state) => state.location.hash });

  useEffect(() => {
    if (!locationHash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(locationHash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [locationHash]);

  const move = (direction: number) => {
    if (fade) return;
    setFade(true);
    setDirection(direction > 0 ? 1 : -1);
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => {
      setStart((current) => ((current + direction + CAKES.length) % CAKES.length));
      setFade(false);
    }, 380);
  };

  const showPage = (page: number) => {
    const nextStart = page * 3;
    if (nextStart === start || fade) return;
    setFade(true);
    setDirection(nextStart > start ? 1 : -1);
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => {
      setStart(nextStart % CAKES.length);
      setFade(false);
    }, 380);
  };

  const featured = [0, 1, 2].map((offset) => CAKES[(start + offset) % CAKES.length]);

  return (
    <main className="bg-[#FFF8F0] text-[#2B2118]">
      <section className="relative min-h-[620px] overflow-hidden bg-[#2B2118] sm:min-h-[680px]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(43,33,24,.96)_0%,rgba(43,33,24,.78)_48%,rgba(43,33,24,.22)_100%),url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600')] bg-cover bg-[center_35%] sm:bg-center" />
        <div className="relative mx-auto flex min-h-[620px] max-w-[1200px] items-center px-5 py-16 sm:min-h-[680px] sm:px-8 lg:px-6 lg:py-20">
          <div className="max-w-2xl text-white">
            <p className="text-xs font-bold tracking-[0.38em] text-[#D8B875]">SWEET SERENITY • YALA, SIAYA COUNTY, KENYA</p>
            <h1 className="mt-6 font-serif text-[42px] leading-[1.08] sm:text-6xl md:text-7xl">Every Celebration Deserves a Beautiful Cake.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">Handcrafted with artistry, made fresh, and finished to make every moment unforgettable.</p>
            <div className="mt-9 flex flex-wrap gap-4"><Link to="/shop" className="rounded-full bg-[#C9A86A] px-7 py-4 text-xs font-bold tracking-[0.16em] text-[#2B2118]">Shop the Collection</Link><Link to="/custom" className="rounded-full border border-white/50 px-7 py-4 text-xs font-bold tracking-[0.16em] text-white">Create Bespoke Cake</Link></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-20">
        <div className="flex items-end justify-between gap-5">
          <div><p className="text-[11px] font-bold tracking-[0.32em] text-[#C9A86A]">ATELIER FAVOURITES</p><h2 className="mt-3 font-serif text-4xl md:text-5xl">Featured Cakes</h2><p className="mt-3 text-[#756858]">Handcrafted daily at Sweet Serenity, Yala, Siaya County, Kenya</p></div>
          <div className="hidden gap-2 sm:flex"><button type="button" aria-label="Previous cakes" onClick={() => move(-3)} className="rounded-full border border-[#D9C39A] bg-white p-3"><ChevronLeft /></button><button type="button" aria-label="Next cakes" onClick={() => move(3)} className="rounded-full border border-[#D9C39A] bg-white p-3"><ChevronRight /></button></div>
        </div>
        <div className={`mt-9 grid gap-7 will-change-transform transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(.22,.61,.36,1)] md:grid-cols-3 ${fade ? direction > 0 ? "-translate-x-3 scale-[0.992] opacity-0" : "translate-x-3 scale-[0.992] opacity-0" : "translate-x-0 scale-100 opacity-100"}`}>
          {featured.map((cake) => (
            <article key={cake.id} className="group overflow-hidden rounded-[24px] border border-[#E5D7BB] bg-white shadow-[0_14px_45px_rgba(92,67,35,.08)]">
              <div className="relative overflow-hidden"><img src={cake.image_url} alt={cake.name} loading="lazy" decoding="async" onError={(event) => { const image = event.currentTarget; if (image.src.endsWith("/images/cakes/hero.jpg")) return; image.src = "/images/cakes/hero.jpg"; }} className="h-[280px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:h-[320px] md:h-[280px]" />{cake.badge && <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold ${cake.badge === "Luxury" ? "bg-[#2B2118] text-white" : "bg-[#C9A86A] text-white"}`}>{cake.badge}</span>}</div>
              <div className="p-6"><p className="text-[10px] font-bold tracking-[0.2em] text-[#C9A86A]">{cake.category.toUpperCase()}</p><h3 className="mt-2 font-serif text-2xl">{cake.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[#756858]">{cake.description}</p><strong className="mt-4 block text-lg">KSh {cake.price.toLocaleString("en-KE")}</strong><div className="mt-5 grid grid-cols-3 gap-2"><Link to="/shop" className="rounded-full border border-[#D9C39A] px-2 py-3 text-center text-xs font-bold">View Details</Link><Link to="/cart" onClick={() => { add({ slug: cake.slug, name: cake.name, image: cake.image_url, size: cake.sizes[0] ?? "Standard", flavour: cake.flavours[0] ?? "Signature selection", price: cake.price }); toast.success(`${cake.name} added to your cart`); }} className="rounded-full bg-[#C9A86A] px-2 py-3 text-center text-xs font-bold text-white">Order Now</Link><button type="button" onClick={() => { add({ slug: cake.slug, name: cake.name, image: cake.image_url, size: cake.sizes[0] ?? "Standard", flavour: cake.flavours[0] ?? "Signature selection", price: cake.price }); toast.success(`${cake.name} added to your cart`); }} className="rounded-full bg-[#2B2118] px-2 py-3 text-xs font-bold text-white">Add</button></div></div>
            </article>
          ))}
        </div>
        <div className="mt-7 flex justify-center gap-2">{[0, 1, 2, 3].map((page) => <button key={page} aria-label={`Show cake collection ${page + 1}`} type="button" onClick={() => showPage(page)} className={`h-2 rounded-full transition-all duration-500 ${Math.floor(start / 3) === page ? "w-8 bg-[#C9A86A]" : "w-2 bg-[#D9C39A]"}`} />)}</div>
      </section>

      <section id="about" className="scroll-mt-28 bg-white py-20"><div className="mx-auto max-w-[1200px] px-4"><div className="mb-12 text-center"><p className="text-[11px] font-bold tracking-[0.32em] text-[#C9A86A]">ABOUT SWEET SERENITY</p><h2 className="mt-3 font-serif text-4xl md:text-5xl">Baked with Heart, Served with Elegance</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#756858] md:text-base">From our Yala atelier, Sweet Serenity creates beautifully handcrafted cakes for weddings, birthdays and every celebration worth remembering.</p></div><div className="grid gap-6 md:grid-cols-3">{[
        ["Freshly Created", "Every cake is prepared fresh for its celebration."],
        ["Atelier Craft", "Refined finishes, considered details and timeless presentation."],
        ["Personal Service", "Attentive guidance from your first idea to collection."],
      ].map(([title, text]) => <div key={title} className="rounded-[22px] border border-[#E5D7BB] bg-[#FFFDF9] p-7"><Sparkles className="text-[#C9A86A]" /><h3 className="mt-4 font-serif text-2xl">{title}</h3><p className="mt-2 text-sm leading-6 text-[#756858]">{text}</p></div>)}</div></div></section>
    </main>
  );
}
