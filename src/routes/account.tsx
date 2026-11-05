import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CakeSlice, CheckCircle, Clock3, Crown, Package, ReceiptText, Sparkles, Truck, XCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../lib/admin";

type Order = {
  id: string;
  reference?: string | null;
  cake_name?: string | null;
  items?: Array<{ name?: string }> | null;
  total?: number | string | null;
  subtotal?: number | string | null;
  status?: string | null;
  created_at?: string | null;
};

const currency = (value: number) => `KSh ${Math.round(value).toLocaleString("en-KE")}`;

const formatOrderDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
};

const shortReference = (order: Order) => {
  const reference = order.reference?.replace(/^GP-/, "") || String(order.id).replace(/-/g, "").slice(0, 8);
  return `GRACE-${reference.toUpperCase()}`;
};

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    setOrdersLoading(true);
    supabase
      .from("orders")
      .select("*")
      .eq("user_email", user.email.toLowerCase())
      .then(({ data, error }) => {
        if (!active) return;
        setOrders((data ?? []) as Order[]);
        setOrdersError(error?.message ?? "");
        setOrdersLoading(false);
      });
    return () => { active = false; };
  }, [user?.email]);

  useEffect(() => {
    if (!loading && isAdmin(user?.email)) {
      console.log("[Admin] Redirecting authenticated admin:", user?.email?.toLowerCase().trim());
      navigate({ to: "/admin" });
    }
  }, [loading, navigate, user?.email]);

  const analytics = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total ?? order.subtotal ?? 0), 0);
    const pendingCount = orders.filter((order) => order.status?.toLowerCase() === "pending").length;
    const cakeCounts = new Map<string, number>();
    orders.forEach((order) => {
      const cakeName = order.cake_name?.trim() || order.items?.[0]?.name?.trim() || "Atelier Cake";
      cakeCounts.set(cakeName, (cakeCounts.get(cakeName) ?? 0) + 1);
    });
    const favouriteCake = [...cakeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No selection yet";
    return { totalSpent, pendingCount, favouriteCake };
  }, [orders]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))),
    [orders],
  );

  if (!loading && !user) {
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF8F0] px-4 py-10">
        <p className="mb-5 text-center text-sm font-medium text-[#80601F]">Preparing your atelier...</p>
        <div className="mx-auto max-w-[1200px] animate-pulse space-y-5">
          <div className="h-56 rounded-[28px] bg-white/80 shadow-sm" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-[22px] bg-white/80" />)}</div>
          <div className="h-72 rounded-[28px] bg-white/80" />
        </div>
      </main>
    );
  }

  if (isAdmin(user?.email)) {
    return (
      <main className="min-h-screen bg-[#FFF8F0] px-4 py-20 text-center text-[#80601F]">
        <p className="mb-5">Opening admin dashboard...</p>
        <Link to="/admin" className="inline-flex rounded-full bg-[#C9A86A] px-6 py-3 font-bold text-[#2B2118] shadow-lg">
          Go to Admin Dashboard
        </Link>
      </main>
    );
  }

  if (!user) {
    return <div className="min-h-screen bg-[#FFF8F0]" />;
  }

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || user.user_metadata?.full_name?.split(/\s+/)[0] || "Member";
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-KE", { month: "long", year: "numeric" })
    : "Atelier member";
  const insight = analytics.pendingCount > 0
    ? `You have ${analytics.pendingCount} ${analytics.pendingCount === 1 ? "order" : "orders"} awaiting atelier confirmation. Our chef will confirm shortly.`
    : orders.length === 0
      ? "Your atelier journey begins. Order your first signature cake."
      : analytics.totalSpent > 20000
        ? "You are in our Top 5% of patrons - Thank you."
        : "Your celebrations are in good hands. Thank you for choosing Grace Patisserie.";

  return (
    <main className="min-h-screen bg-[#FFF8F0] px-4 py-10 text-[#2B2118]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="mx-auto max-w-[1200px]">
        <section className="relative overflow-hidden rounded-[28px] border border-[#eadcbf] bg-white px-7 py-8 shadow-[0_18px_60px_rgba(201,168,106,0.14)] md:px-10">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(201,168,106,.22),transparent_68%)]" />
          <div className="relative flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.38em] text-[#C9A86A]">GRACE PATISSERIE - ATELIER MEMBER</p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-[#2B2118] md:text-5xl" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Welcome back, {firstName}</h1>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#756858]">
                <span>{user.email}</span><span className="hidden text-[#C9A86A] sm:inline">/</span><span>Member since {memberSince}</span>
              </div>
            </div>
            <span className="flex w-fit items-center gap-2 rounded-full border border-[#D8B875] bg-[#FFF4D6] px-4 py-2 text-xs font-bold tracking-[0.16em] text-[#80601F] shadow-sm"><Crown size={15} fill="#C9A86A" /> GOLD MEMBER</span>
          </div>
        </section>

        {ordersLoading && (
          <div className="mt-6 flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[#eadcbf] border-t-[#C9A86A]" />
              <p className="mt-4 text-sm font-semibold tracking-[0.12em] text-[#80601F]">Preparing your atelier...</p>
            </div>
          </div>
        )}

        {!ordersLoading && orders.length === 0 && (
          <WelcomeExperience firstName={firstName} />
        )}

        {!ordersLoading && orders.length > 0 && (
          <>
          <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Total Orders" value={String(orders.length)} icon={<ReceiptText size={20} />} />
            <KpiCard label="Total Spent" value={currency(analytics.totalSpent).replace("KSh ", "KSh ")} icon={<Sparkles size={20} />} />
            <KpiCard label="Pending" value={String(analytics.pendingCount)} icon={<Clock3 size={20} />} />
            <KpiCard label="Favourite Cake" value={analytics.favouriteCake} icon={<CakeSlice size={20} />} wide />
          </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="min-w-0">
            <section className="flex items-start gap-3 rounded-[18px] border border-[#DFC994] bg-gradient-to-r from-[#FFF8E8] to-white px-5 py-4 shadow-sm">
              <Sparkles className="mt-0.5 shrink-0 text-[#C9A86A]" size={20} />
              <p className="text-sm leading-6 text-[#594A39]">{ordersError ? "Your order insights will return shortly." : insight}</p>
            </section>

            <section className="mt-5 overflow-hidden rounded-[24px] border border-[#EEE1C5] bg-white shadow-[0_14px_45px_rgba(92,67,35,0.08)]">
              <div className="flex items-center justify-between border-b border-[#F1E8D6] px-5 py-5 md:px-7">
                <div><p className="text-[10px] font-bold tracking-[0.28em] text-[#C9A86A]">ORDER HISTORY</p><h2 className="mt-1 font-serif text-2xl text-[#2B2118]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Your Atelier Orders</h2></div>
                <span className="rounded-full bg-[#FFF8F0] px-3 py-1 text-xs font-semibold text-[#80601F]">{orders.length} total</span>
              </div>
              {ordersLoading ? <div className="p-7"><div className="h-16 animate-pulse rounded-xl bg-[#F8F3EA]" /></div> : sortedOrders.length === 0 ? (
                <div className="px-6 py-16 text-center"><div className="text-6xl" role="img" aria-label="Cake">🎂</div><h3 className="mt-5 font-serif text-3xl text-[#2B2118]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>No orders yet</h3><p className="mt-2 text-sm text-[#756858]">Your first signature celebration is waiting.</p><Link to="/shop" className="mt-6 inline-flex rounded-full bg-[#C9A86A] px-6 py-3 text-xs font-bold tracking-[0.15em] text-white shadow-[0_10px_25px_rgba(201,168,106,.28)]">Explore Atelier</Link></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-[#FCF9F3] text-[10px] font-bold tracking-[0.16em] text-[#887862]"><tr><th className="px-7 py-4">Order ID</th><th className="px-4 py-4">Cake / Items</th><th className="px-4 py-4">Date</th><th className="px-4 py-4">Total</th><th className="px-7 py-4">Status</th></tr></thead>
                    <tbody>{sortedOrders.map((order) => {
                      const cakeNames = order.cake_name || order.items?.map((item) => item.name).filter(Boolean).join(", ") || "Atelier Cake";
                      const total = Number(order.total ?? order.subtotal ?? 0);
                      return <tr key={order.id} className="border-t border-[#F3EDE1] transition-colors hover:bg-[#FFFDF8]"><td className="px-7 py-5 text-sm font-bold text-[#2B2118]">{shortReference(order)}</td><td className="px-4 py-5 text-sm text-[#594A39]">{cakeNames}</td><td className="px-4 py-5 text-sm text-[#756858]">{formatOrderDate(order.created_at)}</td><td className="px-4 py-5 text-sm font-semibold text-[#2B2118]">{currency(total)}</td><td className="px-7 py-5"><StatusBadge status={order.status} /></td></tr>;
                    })}</tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[24px] border border-[#EEE1C5] bg-white p-6 shadow-[0_14px_45px_rgba(92,67,35,0.08)]">
              <p className="text-[10px] font-bold tracking-[0.28em] text-[#C9A86A]">CONCIERGE</p><h2 className="mt-1 font-serif text-2xl text-[#2B2118]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Quick Actions</h2>
              <div className="mt-5 space-y-3">
                <QuickAction icon={<CakeSlice size={18} />} label="Re-order Last Cake" to="/shop" />
                <QuickAction icon={<Truck size={18} />} label="Track Order" to="/shop" />
                <a href="https://wa.me/254713380906?text=Hello%20Grace%20Patisserie!%20I%20have%20a%20question%20about%20your%20cakes." target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-[14px] border border-[#EFE4CD] px-4 py-3.5 text-sm font-semibold text-[#594A39] transition hover:border-[#C9A86A] hover:bg-[#FFF8F0]"><Package size={18} className="text-[#C9A86A]" />Contact Atelier<span className="ml-auto text-[#C9A86A]">↗</span></a>
              </div>
            </section>
            <section className="overflow-hidden rounded-[24px] bg-[#2B2118] p-6 text-white shadow-[0_14px_45px_rgba(43,33,24,0.18)]">
              <p className="text-[10px] font-bold tracking-[0.28em] text-[#D8B875]">ATELIER HOURS</p><h2 className="mt-2 font-serif text-2xl" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Eldoret</h2><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm"><span className="text-white/65">Monday - Saturday</span><strong>8am - 7pm</strong></div><div className="mt-3 flex items-center justify-between text-sm"><span className="text-white/65">Sunday</span><strong>Private orders</strong></div>
            </section>
          </aside>
        </div>
          </>
        )}
      </div>
    </main>
  );
}

function WelcomeExperience({ firstName }: { firstName: string }) {
  return (
    <div>
      <section className="relative mt-6 overflow-hidden rounded-[28px] border border-[#C9A86A] bg-[#FFF8F0] px-6 py-14 text-center shadow-[0_18px_60px_rgba(201,168,106,0.14)] md:px-12 md:py-16">
        <div className="absolute left-8 top-8 h-24 w-24 rounded-full border border-[#C9A86A]/20" />
        <div className="absolute bottom-8 right-8 h-24 w-24 rounded-full border border-[#C9A86A]/20" />
        <p className="text-[11px] font-bold tracking-[0.38em] text-[#C9A86A]">GRACE PATISSERIE • ELDORET ATELIER</p>
        <h2 className="mt-5 font-serif text-4xl leading-tight text-[#2B2118] md:text-6xl" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Welcome to Grace Patisserie, {firstName}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#756858] md:text-lg">Your sweet sanctuary awaits. Where every cake is a work of art, baked with love.</p>
        <div className="mt-7 text-[#C9A86A] tracking-[1em]">✦ ✦ ✦</div>
        <span className="mt-7 inline-flex rounded-full border border-[#D8B875] bg-[#FFF4D6] px-5 py-2 text-[11px] font-bold tracking-[0.18em] text-[#80601F]">NEW ATELIER MEMBER</span>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        <WelcomeFeature emoji="🎂" title="Order Your First Cake" text="Signature cakes crafted fresh for your celebrations." label="Order Now" to="/shop" />
        <WelcomeFeature emoji="🥐" title="Explore Cakes" text="Velvet, Chocolate Truffle, Red Velvet & more atelier favourites." label="Explore Cakes" to="/shop" />
        <WelcomeFeature emoji="📜" title="View Menu" text="Pastries, Croissants, Breads & our full atelier collection." label="View Menu" to="/menu" />
      </section>

      <section className="mt-6 flex flex-col gap-5 rounded-[24px] bg-[#2B2118] px-7 py-8 md:flex-row md:items-center md:justify-between md:px-10">
        <p className="max-w-xl font-serif text-xl leading-relaxed text-[#D8B875] md:text-2xl" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Your first order is special. Let our atelier create something unforgettable for you.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/shop" className="rounded-full bg-[#C9A86A] px-6 py-3 text-center text-xs font-bold tracking-[0.12em] text-[#2B2118]">Start Your Order →</Link>
          <a href="https://wa.me/254713380906?text=Hello%20Grace%20Patisserie!%20I%20have%20a%20question%20about%20your%20cakes." target="_blank" rel="noreferrer" className="rounded-full border border-[#D8B875] px-6 py-3 text-center text-xs font-bold tracking-[0.12em] text-[#D8B875]">Chat on WhatsApp</a>
        </div>
      </section>
    </div>
  );
}

function WelcomeFeature({ emoji, title, text, label, to }: { emoji: string; title: string; text: string; label: string; to: string }) {
  return (
    <article className="border-t-[3px] border-t-[#C9A86A] rounded-[22px] border border-[#EEE1C5] bg-white px-6 py-7 text-center shadow-[0_14px_45px_rgba(92,67,35,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(92,67,35,0.14)]">
      <div className="text-5xl" aria-hidden="true">{emoji}</div>
      <h3 className="mt-5 font-serif text-2xl uppercase text-[#2B2118]" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>{title}</h3>
      <p className="mt-3 min-h-12 text-sm leading-6 text-[#756858]">{text}</p>
      {to === "/menu" ? <a href="/menu" className="mt-6 inline-flex rounded-full border border-[#C9A86A] px-5 py-2.5 text-xs font-bold tracking-[0.12em] text-[#80601F]">{label} →</a> : <Link to="/shop" className="mt-6 inline-flex rounded-full border border-[#C9A86A] px-5 py-2.5 text-xs font-bold tracking-[0.12em] text-[#80601F]">{label} →</Link>}
    </article>
  );
}

function KpiCard({ label, value, icon, wide = false }: { label: string; value: string; icon: React.ReactNode; wide?: boolean }) {
  return <article className={`min-h-32 rounded-[22px] border border-[#EEE1C5] border-t-[3px] border-t-[#C9A86A] bg-white p-5 shadow-[0_10px_30px_rgba(92,67,35,0.06)] ${wide ? "col-span-2 lg:col-span-1" : ""}`}><div className="flex items-center justify-between text-[#C9A86A]">{icon}<span className="h-px w-8 bg-[#E6D2A6]" /></div><div className="mt-4 truncate text-2xl font-semibold text-[#2B2118]" title={value}>{value}</div><div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#887862]">{label}</div></article>;
}

function StatusBadge({ status }: { status?: string | null }) {
  const normalized = status?.toLowerCase() ?? "pending";
  const styles: Record<string, string> = {
    pending: "border-amber-300 bg-amber-100 text-amber-900",
    confirmed: "border-green-300 bg-green-100 text-green-800",
    delivered: "border-green-700 bg-[#059669] text-white",
    cancelled: "border-red-300 bg-red-100 text-red-800",
  };
  const Icon = normalized === "confirmed" ? CheckCircle : normalized === "delivered" ? Truck : normalized === "cancelled" ? XCircle : Clock3;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] ${styles[normalized] ?? styles.pending}`}><Icon size={13} />{normalized.toUpperCase()}</span>;
}

function QuickAction({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return <Link to={to} className="flex items-center gap-3 rounded-[14px] border border-[#EFE4CD] px-4 py-3.5 text-sm font-semibold text-[#594A39] transition hover:border-[#C9A86A] hover:bg-[#FFF8F0]"><span className="text-[#C9A86A]">{icon}</span><span>{label}</span><span className="ml-auto text-[#C9A86A]">›</span></Link>;
}
