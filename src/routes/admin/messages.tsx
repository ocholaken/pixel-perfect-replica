import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Mail, PackageCheck, Search, Trash2, X, CakeSlice, Inbox } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { isAdmin } from "../../lib/admin";

export const Route = createFileRoute("/admin/messages")({ component: AdminMessages });

type Message = { id: string; name: string; email: string; message: string; status: string; created_at: string };

function AdminMessages() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Message | null>(null);

  console.log("[Admin Messages] Authenticated user email:", user?.email?.toLowerCase().trim());

  const fetchMessages = async () => {
    setLoadError("");
    const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (error) {
      console.log("Messages error:", error.message);
      setMessages([]);
      setLoadError(error.message);
      toast.error("Could not load customer messages.");
    } else setMessages(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    console.log("Admin check - user:", user?.email, "isAdmin:", isAdmin(user?.email));
    if (authLoading || !isAdmin(user?.email)) return;
    void fetchMessages();
    const channel = supabase.channel("atelier-messages").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      const message = payload.new as Message;
      setMessages((current) => [message, ...current]);
      toast.success(`New message from ${message.name}`);
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin(user.email))) navigate({ to: "/account" });
  }, [authLoading, navigate, user?.email]);

  const filtered = useMemo(() => messages.filter((item) => {
    const matchesStatus = filter === "all" || item.status === filter;
    const needle = search.trim().toLowerCase();
    return matchesStatus && (!needle || [String(item.name ?? ""), String(item.email ?? ""), String(item.message ?? "")].join(" ").toLowerCase().includes(needle));
  }), [messages, filter, search]);
  const unread = messages.filter((item) => item.status === "unread").length;
  const today = messages.filter((item) => new Date(item.created_at).toDateString() === new Date().toDateString()).length;

  if (authLoading || loading) return <main className="min-h-screen bg-[#FFF8F0] px-5 py-16 text-center text-[#756858]">Preparing atelier messages...</main>;
  if (!user) return <main className="min-h-screen bg-[#FFF8F0] px-5 py-16 text-center">Please sign in to continue.</main>;
  if (loadError) return <main className="min-h-screen bg-[#FFF8F0] grid place-items-center px-5"><div className="max-w-lg rounded-[24px] bg-white p-8 text-center shadow-lg"><h1 className="font-serif text-2xl">Messages could not be loaded</h1><p className="mt-3 break-words text-sm text-red-700">{loadError}</p><button type="button" onClick={() => void fetchMessages()} className="mt-6 rounded-full bg-[#2B2118] px-6 py-3 text-sm font-bold text-white">Try Again</button></div></main>;

  const markRead = async (id: string) => {
    const { error } = await supabase.from("messages").update({ status: "read" }).eq("id", id);
    if (error) return toast.error("Could not update this message.");
    setMessages((current) => current.map((item) => item.id === id ? { ...item, status: "read" } : item));
    setSelected((current) => current?.id === id ? { ...current, status: "read" } : current);
    toast.success("Message marked as read.");
  };
  const removeMessage = async (id: string) => {
    if (!window.confirm("Delete this customer message? This cannot be undone.")) return;
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) return toast.error("Could not delete this message.");
    setMessages((current) => current.filter((item) => item.id !== id));
    setSelected(null);
    toast.success("Message deleted.");
  };
  const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
  const initials = (name: string) => (name ?? "").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return <main className="min-h-screen bg-[#F7F3EC] text-[#2B2118] lg:flex">
    <aside className="bg-[#1A120B] px-5 py-7 text-white lg:w-64 lg:shrink-0">
      <div className="flex items-center gap-3 border-b border-white/10 pb-6"><CakeSlice className="text-[#C9A86A]" /><div><strong>GRACE</strong><small className="block tracking-[.25em] text-[#C9A86A]">PATISSERIE</small></div></div>
      <nav className="mt-7 flex gap-2 overflow-x-auto lg:block lg:space-y-2">
        <Link to="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70"><LayoutDashboard size={18}/>Dashboard</Link>
        <Link to="/admin/orders" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70"><PackageCheck size={18}/>Orders</Link>
        <Link to="/admin/messages" className="flex items-center gap-3 rounded-xl bg-[#C9A86A] px-4 py-3 text-sm font-bold text-[#1A120B]"><Mail size={18}/>Messages</Link>
        <Link to="/shop" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70"><CakeSlice size={18}/>Cakes</Link>
      </nav>
    </aside>
    <div className="min-w-0 flex-1 px-4 py-8 sm:px-8">
      <header><p className="text-xs font-bold tracking-[.25em] text-[#C9A86A]">ATELIER CONCIERGE</p><h1 className="mt-2 font-serif text-4xl">Customer Messages</h1><p className="mt-2 text-sm text-[#756858]">Every message from your atelier footer</p></header>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Total Messages", messages.length, ""], ["Unread", unread, "bg-[#FEF3C7]"], ["Read", messages.length-unread, "bg-[#DCFCE7]"], ["Today", today, ""]].map(([label, value, style]) => <div key={String(label)} className={`rounded-[20px] border border-[#E8DCC7] p-5 shadow-sm ${style}`}><p className="text-xs font-bold uppercase tracking-wider text-[#756858]">{label}</p><p className="mt-3 font-serif text-3xl">{value}</p></div>)}</section>
      <section className="mt-8 rounded-[24px] bg-white p-4 shadow-[0_18px_50px_rgba(67,48,28,.08)] sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex gap-2">{["all","unread","read"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase ${filter === item ? "bg-[#2B2118] text-white" : "bg-[#F7F3EC] text-[#756858]"}`}>{item}</button>)}</div><label className="flex items-center gap-2 rounded-full border border-[#E8DCC7] px-4 py-2.5"><Search size={16}/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search messages..." className="min-w-0 bg-transparent text-sm outline-none md:w-64"/></label></div>
        {loading ? <p className="py-16 text-center text-sm text-[#756858]">Loading atelier messages...</p> : filtered.length === 0 ? <div className="py-16 text-center"><Inbox className="mx-auto text-[#C9A86A]" size={42}/><h2 className="mt-4 font-serif text-2xl">No messages yet</h2><p className="mt-2 text-sm text-[#756858]">Your footer form will bring them here.</p></div> : <>
          <div className="mt-6 hidden overflow-x-auto lg:block"><table className="w-full min-w-[900px]"><thead><tr className="text-left text-[10px] uppercase tracking-[.18em] text-[#8D806D]"><th className="px-3 pb-4">Date</th><th className="pb-4">Customer</th><th className="pb-4">Message</th><th className="pb-4">Status</th><th className="pb-4">Action</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-t border-[#EFE7D8]"><td className="px-3 py-5 text-sm text-[#756858]">{formatDate(item.created_at)}</td><td className="py-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FFF0CD] text-xs font-bold text-[#80601F]">{initials(item.name)}</span><div><strong className="block text-sm">{String(item.name ?? "")}</strong><span className="break-all text-xs text-[#756858]">{String(item.email ?? "")}</span></div></div></td><td className="max-w-[280px] py-5 text-sm text-[#594A39]">{String(item.message ?? "").slice(0,80)}{String(item.message ?? "").length > 80 ? "..." : ""}</td><td className="py-5"><span className="inline-flex rounded-full bg-[#DCFCE7] px-3 py-1.5 text-[10px] font-bold">{String(item.status ?? "unread").toUpperCase()}</span></td><td className="py-5"><button onClick={() => setSelected(item)} className="min-h-10 rounded-full border border-[#C9A86A] px-3 py-2 text-xs font-bold">View Full Message</button></td></tr>)}</tbody></table></div>
          <div className="mt-6 grid gap-3 lg:hidden">{filtered.map((item) => <article key={item.id} className="rounded-[18px] border border-[#E8DCC7] bg-[#FFFCF8] p-4"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFF0CD] text-xs font-bold text-[#80601F]">{initials(item.name)}</span><div className="min-w-0"><strong className="block break-words">{String(item.name ?? "")}</strong><p className="break-all text-xs text-[#756858]">{String(item.email ?? "")}</p></div><span className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.status === "unread" ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#DCFCE7] text-[#166534]"}`}>{String(item.status ?? "unread").toUpperCase()}</span></div><p className="mt-4 text-sm leading-6 text-[#594A39]">{String(item.message ?? "")}</p><p className="mt-3 text-xs text-[#756858]">{formatDate(item.created_at)}</p><button onClick={() => setSelected(item)} className="mt-4 min-h-11 w-full rounded-full border border-[#C9A86A] px-4 py-2 text-xs font-bold">View Full Message</button></article>)}</div>
        </>}
      </section>
    </div>
    {selected && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Customer message"><div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[24px] bg-[#FFF8F0] p-7 shadow-2xl"><button aria-label="Close message" onClick={() => setSelected(null)} className="absolute right-5 top-5"><X/></button><p className="text-xs font-bold tracking-[.25em] text-[#C9A86A]">PRIVATE MESSAGE</p><h2 className="mt-3 font-serif text-3xl">{selected.name}</h2><p className="mt-1 text-sm text-[#756858]">{selected.email}</p><div className="mt-6 whitespace-pre-wrap rounded-[18px] border border-[#E8DCC7] bg-white p-5 leading-7">{selected.message}</div><div className="mt-6 flex flex-wrap gap-3">{selected.status !== "read" && <button onClick={() => void markRead(selected.id)} className="rounded-full bg-[#16A34A] px-4 py-2.5 text-xs font-bold text-white">Mark as Read</button>}<a href={`mailto:${selected.email}?subject=${encodeURIComponent("Grace Patisserie - Your enquiry")}`} className="rounded-full border border-[#C9A86A] px-4 py-2.5 text-xs font-bold">Reply via Email</a><button onClick={() => void removeMessage(selected.id)} className="ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-red-600"><Trash2 size={15}/>Delete</button></div></div></div>}
  </main>;
}
