import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Clock, Search, Truck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { isAdmin } from "../../lib/admin";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrdersPage });

type Order = { id: string; user_name?: string; user_email?: string; cake_name?: string; items?: any[]; total_price?: number; total?: number; subtotal?: number; status?: string; created_at?: string };
const currency = (value: number) => `KSh ${value.toLocaleString("en-KE")}`;
const shortId = (id: string) => `GRACE-${id.replace(/-/g, "").slice(-6).toUpperCase()}`;
const itemLabel = (order: Order) => Array.isArray(order.items) ? order.items.map((item) => item?.name ?? item?.cake_name).filter(Boolean).join(", ") || order.cake_name || "Atelier order" : order.cake_name || "Atelier order";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = { pending: "border-[#F59E0B]/30 bg-[#FEF3C7] text-[#92400E]", confirmed: "border-[#22C55E]/30 bg-[#DCFCE7] text-[#166534]", delivered: "border-[#059669] bg-[#059669] text-white", cancelled: "border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${styles[status] ?? styles.pending}`}>{status === "pending" && <Clock size={12}/>}{status === "confirmed" && <Check size={12}/>}{status === "delivered" && <Truck size={12}/>}{status === "cancelled" && <X size={12}/>}{status.toUpperCase()}</span>;
}

function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  console.log("[Admin Orders] Authenticated user email:", user?.email?.toLowerCase().trim());

  const fetchOrders = async () => {
    setLoading(true);
    setLoadError("");
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) {
      console.log("Orders error:", error.message);
      setOrders([]);
      setLoadError(error.message);
      toast.error("Unable to load atelier orders.");
    } else {
      setOrders(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };
  useEffect(() => {
    console.log("Admin check - user:", user?.email, "isAdmin:", isAdmin(user?.email));
    if (!authLoading && (!user || !isAdmin(user.email))) navigate({ to: "/account" });
    if (!authLoading && user && isAdmin(user.email)) void fetchOrders();
  }, [authLoading, navigate, user?.email, user?.id]);

  const filtered = useMemo(() => orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    const needle = search.trim().toLowerCase();
    return matchesFilter && (!needle || [shortId(order.id ?? ""), String(order.user_email ?? ""), String(order.user_name ?? ""), itemLabel(order)].join(" ").toLowerCase().includes(needle));
  }), [orders, filter, search]);

  if (authLoading || loading) return <main className="min-h-screen bg-[#FFF8F0] px-5 py-16 text-center text-[#756858]">Preparing order atelier...</main>;
  if (!user) return <main className="min-h-screen bg-[#FFF8F0] px-5 py-16 text-center">Please sign in to continue.</main>;
  if (loadError) return <main className="min-h-screen bg-[#FFF8F0] grid place-items-center px-5"><div className="max-w-lg rounded-[24px] bg-white p-8 text-center shadow-lg"><h1 className="font-serif text-2xl">Orders could not be loaded</h1><p className="mt-3 break-words text-sm text-red-700">{loadError}</p><button type="button" onClick={() => void fetchOrders()} className="mt-6 rounded-full bg-[#2B2118] px-6 py-3 text-sm font-bold text-white">Try Again</button></div></main>;

  const updateStatus = async (orderId: string, status: string, message: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) return toast.error("Could not update the order.");
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
    toast.success(message);
  };
  const revenue = orders.reduce((sum, order) => sum + Number(order.total_price ?? order.total ?? order.subtotal ?? 0), 0);
  const count = (status: string) => orders.filter((order) => order.status === status).length;

  return <main className="min-h-screen bg-[#FFF8F0] px-4 py-12 text-[#2B2118]">
    <div className="mx-auto max-w-[1400px]">
      <Link to="/" className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A86A]">Grace Patisserie</Link>
      <h1 className="mt-3 font-serif text-5xl">Admin Orders</h1>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Total Orders", orders.length], ["Pending", count("pending")], ["Confirmed", count("confirmed")], ["Total Revenue", currency(revenue)]].map(([label, value]) => <div key={String(label)} className="rounded-[20px] border-t-[3px] border-[#C9A86A] bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[#756858]">{label}</p><p className="mt-3 font-serif text-3xl">{value}</p></div>)}</section>
      <section className="mt-8 rounded-[24px] border border-[#E9DCC5] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{["all", "pending", "confirmed", "delivered", "cancelled"].map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase ${filter === item ? "bg-[#2B2118] text-white" : "bg-[#FFF8F0] text-[#756858]"}`}>{item}</button>)}</div><label className="flex items-center gap-2 rounded-full border border-[#E8D8B8] px-4 py-2.5"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders..." className="w-full bg-transparent text-sm outline-none lg:w-64"/></label></div>
        <div className="mt-6 hidden overflow-x-auto lg:block"><table className="w-full min-w-[1000px]"><thead><tr className="text-left text-[10px] uppercase tracking-[0.18em] text-[#9A8060]"><th className="px-4 pb-4">Order ID</th><th className="pb-4">Customer</th><th className="pb-4">Cake / Items</th><th className="pb-4">Date</th><th className="pb-4">Total</th><th className="pb-4">Status</th><th className="pb-4">Action</th></tr></thead><tbody>{filtered.map((order) => { const status = String(order.status ?? "pending").toLowerCase(); return <tr key={order.id} className="border-t border-[#F1E7D4]"><td className="px-4 py-5 font-bold">{shortId(order.id)}</td><td className="py-5"><strong className="block text-sm">{String(order.user_name ?? "Atelier customer")}</strong><span className="break-all text-xs text-[#756858]">{String(order.user_email ?? "")}</span></td><td className="max-w-[220px] py-5 text-sm">{itemLabel(order)}</td><td className="py-5 text-sm">{order.created_at ? new Date(order.created_at).toLocaleDateString("en-GB") : "-"}</td><td className="py-5 font-semibold">{currency(Number(order.total_price ?? order.total ?? order.subtotal ?? 0))}</td><td className="py-5"><StatusBadge status={status}/></td><td className="py-5">{status === "pending" && <div className="flex gap-2"><button onClick={() => void updateStatus(order.id, "confirmed", "Order Confirmed - Customer will now see GREEN")} className="min-h-10 rounded-full bg-[#16A34A] px-3 py-2 text-xs font-bold text-white">Confirm Order</button><button onClick={() => void updateStatus(order.id, "cancelled", "Order Cancelled")} className="min-h-10 rounded-full border border-[#DC2626] px-3 py-2 text-xs font-bold text-[#DC2626]">Cancel</button></div>}{status === "confirmed" && <button onClick={() => void updateStatus(order.id, "delivered", "Order marked as delivered")} className="min-h-10 rounded-full bg-[#059669] px-3 py-2 text-xs font-bold text-white">Mark as Delivered</button>}</td></tr>; })}</tbody></table></div>
        <div className="mt-6 grid gap-3 lg:hidden">{filtered.map((order) => { const status = String(order.status ?? "pending").toLowerCase(); return <article key={order.id} className="rounded-[18px] border border-[#E9DCC5] bg-[#FFFCF7] p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block">{order.user_name || "Atelier customer"}</strong><p className="break-all text-xs text-[#756858]">{String(order.user_email ?? "")}</p></div><StatusBadge status={status}/></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-[10px] font-bold uppercase text-[#9A8060]">Order</dt><dd className="mt-1 font-bold">{shortId(order.id)}</dd></div><div><dt className="text-[10px] font-bold uppercase text-[#9A8060]">Total</dt><dd className="mt-1 font-bold">{currency(Number(order.total_price ?? order.total ?? order.subtotal ?? 0))}</dd></div><div className="col-span-2"><dt className="text-[10px] font-bold uppercase text-[#9A8060]">Cake / Items</dt><dd className="mt-1">{itemLabel(order)}</dd></div></dl><div className="mt-4 flex flex-wrap gap-2">{status === "pending" && <><button onClick={() => void updateStatus(order.id, "confirmed", "Order Confirmed")} className="min-h-11 flex-1 rounded-full bg-[#16A34A] px-4 py-2 text-xs font-bold text-white">Confirm</button><button onClick={() => void updateStatus(order.id, "cancelled", "Order Cancelled")} className="min-h-11 flex-1 rounded-full border border-[#DC2626] px-4 py-2 text-xs font-bold text-[#DC2626]">Cancel</button></>}{status === "confirmed" && <button onClick={() => void updateStatus(order.id, "delivered", "Order marked as delivered")} className="min-h-11 w-full rounded-full bg-[#059669] px-4 py-2 text-xs font-bold text-white">Mark as Delivered</button>}</div></article>; })}</div>
        {!filtered.length && <p className="py-12 text-center text-sm text-[#756858]">No orders match this view.</p>}
      </section>
    </div>
  </main>;
}
