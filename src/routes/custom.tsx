import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock3, Gift, Loader2, MapPin, Palette, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

export const Route = createFileRoute("/custom")({ component: Custom });

const CAKE_TYPES = ["Birthday", "Wedding", "Graduation", "Celebration"];
const SIZES = ["6 inch", "8 inch", "10 inch", "12 inch"];
const TIERS = ["1", "2", "3", "4"];
const FLAVOURS = ["Vanilla", "Chocolate", "Red velvet", "Caramel"];
const FROSTINGS = ["Buttercream", "Fondant", "Cream cheese"];

function Custom() {
  const [size, setSize] = useState("8 inch");
  const [tiers, setTiers] = useState("1");
  const [type, setType] = useState("Birthday");
  const [flavour, setFlavour] = useState("Vanilla");
  const [frosting, setFrosting] = useState("Buttercream");
  const [fulfilment, setFulfilment] = useState("Delivery");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const estimate = useMemo(
    () => 2800 + (Number(size.split(" ")[0]) || 8) * 160 + Number(tiers) * 1800 + (type === "Wedding" ? 3500 : 0),
    [size, tiers, type],
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const tierCount = Number(tiers);
    setLoading(true);
    const reference = `GC-${Date.now().toString().slice(-8)}`;
    const { error } = await supabase.from("cake_orders").insert({
      reference,
      cake_type: type,
      size,
      tiers: tierCount,
      number_of_tiers: tierCount,
      flavour,
      frosting,
      colour_theme: String(form.get("colour_theme") || ""),
      design_notes: String(form.get("design") || ""),
      personalised_message: String(form.get("message") || ""),
      order_date: String(form.get("date") || ""),
      pickup_time: String(form.get("time") || "") || null,
      fulfilment,
      delivery_location: String(form.get("location") || ""),
      additional_instructions: String(form.get("instructions") || ""),
      estimated_total: estimate,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      console.error("Custom cake request failed:", error);
      toast.error(error.message || "Your request could not be submitted.");
      return;
    }
    setSubmitted(true);
    toast.success("Your custom cake request is with our atelier.");
  };

  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#2B2118]">
      <section className="border-b border-[#E8D7B5] bg-[#1A120B] px-5 py-16 text-center text-white sm:py-20">
        <p className="text-xs font-bold tracking-[0.32em] text-[#C9A86A]">THE BESPOKE ATELIER</p>
        <h1 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Your Celebration, Crafted Exclusively</h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#D6C7B0] sm:text-base">Tell our master bakers what you imagine. We will shape every detail into a cake worthy of the occasion.</p>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
        {submitted ? (
          <div className="mx-auto max-w-2xl rounded-[28px] border border-[#C9A86A]/40 bg-white px-6 py-16 text-center shadow-[0_24px_70px_rgba(92,67,35,.12)]">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#DCFCE7] text-[#166534]"><Sparkles size={34}/></span>
            <p className="mt-7 text-xs font-bold tracking-[0.28em] text-[#C9A86A]">REQUEST RECEIVED</p>
            <h2 className="mt-3 font-serif text-4xl">Your atelier consultation begins</h2>
            <p className="mx-auto mt-4 max-w-lg leading-7 text-[#756858]">We have received your bespoke cake brief. Our cake consultant will confirm availability, artistry details and the final quote.</p>
            <button type="button" onClick={() => setSubmitted(false)} className="mt-7 rounded-full bg-[#2B2118] px-7 py-3 text-sm font-bold text-white">Create Another Cake</button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="overflow-hidden rounded-[28px] border border-[#C9A86A]/35 bg-[#1A120B] shadow-[0_24px_70px_rgba(43,33,24,.18)]">
                <img src="/images/cakes/custom-floral.jpg" alt={`${type} custom cake inspiration`} className="h-[260px] w-full object-cover sm:h-[340px] lg:h-[300px]" />
                <div className="p-6 text-white">
                  <p className="text-[10px] font-bold tracking-[0.28em] text-[#C9A86A]">YOUR CAKE VISION</p>
                  <h2 className="mt-3 font-serif text-3xl">{type} Atelier Cake</h2>
                  <p className="mt-3 text-sm leading-6 text-[#D6C7B0]">{size} · {tiers === "1" ? "Single tier" : `${tiers} tiers`} · {flavour} · {frosting}</p>
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <span className="text-xs text-[#D6C7B0]">Estimated investment</span>
                    <strong className="mt-1 block font-serif text-3xl text-[#D8B875]">KES {estimate.toLocaleString("en-KE")}</strong>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-xs leading-5 text-[#756858]">Final pricing follows our design consultation and approved specifications.</p>
            </aside>

            <form onSubmit={submit} className="min-w-0 rounded-[28px] border border-[#E8D7B5] bg-white p-5 shadow-[0_24px_70px_rgba(92,67,35,.09)] sm:p-8">
              <div className="flex items-center gap-3 border-b border-[#EEE4D4] pb-6"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#FFF3D8] text-[#80601F]"><Gift size={20}/></span><div><p className="text-[10px] font-bold tracking-[0.25em] text-[#C9A86A]">PRIVATE COMMISSION</p><h2 className="font-serif text-3xl">Custom Cake Details</h2></div></div>

              <fieldset className="mt-7">
                <legend className="text-sm font-bold">Cake type</legend>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{CAKE_TYPES.map((item) => <button key={item} type="button" onClick={() => setType(item)} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${type === item ? "border-[#C9A86A] bg-[#FFF3D8] text-[#80601F]" : "border-[#E8D7B5] bg-white hover:border-[#C9A86A]"}`}>{item}</button>)}</div>
              </fieldset>

              <div className="mt-7 grid gap-5 sm:grid-cols-3">
                <Field label="Size"><select value={size} onChange={(event) => setSize(event.target.value)}>{SIZES.map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Number of tiers"><select value={tiers} onChange={(event) => setTiers(event.target.value)}>{TIERS.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
                <Field label="Flavour"><select value={flavour} onChange={(event) => setFlavour(event.target.value)}>{FLAVOURS.map((item) => <option key={item}>{item}</option>)}</select></Field>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field label="Frosting"><select value={frosting} onChange={(event) => setFrosting(event.target.value)}>{FROSTINGS.map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Colour theme" icon={<Palette size={17}/>}><input name="colour_theme" placeholder="e.g. ivory, champagne gold and blush"/></Field>
              </div>

              <div className="mt-7 space-y-5">
                <Field label="Preferred design"><textarea name="design" rows={3} placeholder="Describe the design, flowers, details or inspiration"/></Field>
                <Field label="Personalised message"><input name="message" placeholder="Happy Birthday"/></Field>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field label="Required date" icon={<CalendarDays size={17}/>}><input name="date" type="date" required/></Field>
                <Field label="Required time" icon={<Clock3 size={17}/>}><input name="time" type="time" required/></Field>
              </div>

              <fieldset className="mt-7">
                <legend className="text-sm font-bold">Fulfilment</legend>
                <div className="mt-3 grid grid-cols-2 gap-2">{["Delivery", "Collection"].map((item) => <button key={item} type="button" onClick={() => setFulfilment(item)} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${fulfilment === item ? "border-[#C9A86A] bg-[#FFF3D8] text-[#80601F]" : "border-[#E8D7B5]"}`}>{item}</button>)}</div>
              </fieldset>

              {fulfilment === "Delivery" && <div className="mt-5"><Field label="Delivery location" icon={<MapPin size={17}/>}><input name="location" placeholder="Yala, Siaya County delivery address"/></Field></div>}
              <div className="mt-5"><Field label="Additional instructions"><textarea name="instructions" rows={3} placeholder="Dietary needs, delivery notes or anything else our atelier should know"/></Field></div>

              <div className="mt-7 flex flex-col gap-3 border-t border-[#EEE4D4] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#756858]">Estimated total</span><strong className="mt-1 block font-serif text-3xl text-[#80601F]">KES {estimate.toLocaleString("en-KE")}</strong></div>
                <button disabled={loading} className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A86A] to-[#A88B4F] px-7 text-sm font-bold text-white shadow-lg disabled:opacity-70 sm:min-w-[230px]">{loading ? <><Loader2 size={18} className="animate-spin"/>Submitting...</> : <>Request Custom Cake <Sparkles size={17}/></>}</button>
              </div>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}

function Field({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return <label className="block text-sm font-bold text-[#594A39]">{label}<span className="relative mt-2 block">{icon && <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#A88B4F]">{icon}</span>} {children}</span></label>;
}
