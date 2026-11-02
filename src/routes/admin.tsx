import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ProtectedRoute } from "../components/auth-route";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Bell, CheckCircle2, Download, LayoutDashboard, Mail, Menu, MessageSquare, PackageCheck, ShoppingBag, Trash2, Users, X, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: Admin });

      type Order = { id:string; reference?:string; user_id?:string|null; user_email?:string|null; cake_name?:string|null; cake_type?:string|null; quantity?:number|null; price?:number|null; total?:number|null; subtotal?:number|null; status:string; delivery_date?:string|null; order_date?:string|null; delivery_address?:string|null; delivery_location?:string|null; phone?:string|null; customer_id?:string|null; created_at:string; items?:Array<{name:string;quantity:number}>; customers?:{full_name:string;email?:string}|null };
      type Contact = { id:string; name:string; email:string; message:string; type:string; created_at:string; read:boolean };
      type Tab = "Dashboard"|"Orders"|"Messages"|"Reports"|"Users"|"Analytics";

      function Admin() {
        const navigate = useNavigate();
        const [orders, setOrders] = useState<Order[]>([]);
        const [contacts, setContacts] = useState<Contact[]>([]);
        const [profiles, setProfiles] = useState<Array<{id:string;email:string|null;full_name:string|null;role:string|null;created_at?:string|null}>>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [tab, setTab] = useState<Tab>("Dashboard");
        const [sidebar, setSidebar] = useState(false);
        const [search, setSearch] = useState("");
        const [statusFilter, setStatusFilter] = useState("all");
        const [adminEmail, setAdminEmail] = useState("");
        const [dateRange, setDateRange] = useState("month");
        const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

        useEffect(() => {
          const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate({ to: "/" }); return; }
            setAdminEmail(user.email ?? "");
            const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
            if (profile?.role !== "admin") { toast.error("Admin only"); navigate({ to: "/" }); return; }
            const [orderResult, contactResult, profileResult] = await Promise.all([
              supabase.from("orders").select("*").order("created_at",{ascending:false}),
              supabase.from("contacts").select("*").order("created_at",{ascending:false}),
              supabase.from("profiles").select("id,email,full_name,role,created_at").order("created_at",{ascending:false}),
            ]);
            setOrders((orderResult.data ?? []) as Order[]);
            setContacts((contactResult.data ?? []) as Contact[]);
            setProfiles((profileResult.data ?? []) as Array<{id:string;email:string|null;full_name:string|null;role:string|null;created_at?:string|null}>);
            setError(orderResult.error?.message || contactResult.error?.message || profileResult.error?.message || "");
            setLoading(false);
          };
          load();
        }, [navigate]);

        const currency = (value:number) => `KES ${Number(value || 0).toLocaleString()}`;
        const orderName = (order:Order) => order.cake_name || order.items?.[0]?.name || "Atelier Cake";
        const orderType = (order:Order) => order.cake_type || order.items?.[0]?.name || "Celebration Cake";
        const orderEmail = (order:Order) => order.user_email || order.customers?.email || "";
        const orderTotal = (order:Order) => Number(order.total ?? order.subtotal ?? Number(order.price || 0) * Number(order.quantity || 1));
        const orderDateValue = (order:Order) => order.delivery_date || order.order_date || "";
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthOrders = orders.filter(order => new Date(order.created_at) >= monthStart);
        const monthRevenue = monthOrders.reduce((sum, order) => sum + orderTotal(order), 0);
        const unread = contacts.filter(contact => !contact.read).length;

        const last7Days = useMemo(() => Array.from({length:7},(_,index) => {
          const date = new Date(); date.setHours(0,0,0,0); date.setDate(date.getDate()-(6-index));
          const label = date.toLocaleDateString("en",{weekday:"short"});
          return { day:label, orders:orders.filter(order => new Date(order.created_at).toDateString() === date.toDateString()).length };
        }),[orders]);
        const cakeBreakdown = useMemo(() => {
          const counts = new Map<string,number>();
          orders.forEach(order => { const type=orderType(order).trim() || "Celebration"; counts.set(type,(counts.get(type)||0)+(Number(order.quantity)||1)); });
          return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,value])=>({name,value}));
        },[orders]);
        const filteredOrders = orders.filter(order => {
          const haystack = `${orderEmail(order)} ${orderName(order)} ${orderType(order)} ${order.reference || ""}`.toLower();
          return haystack.includes(search.toLower().trim()) && (statusFilter==="all" || order.status===statusFilter);
        }).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));

        const updateStatus = async (id:string,status:string) => {
          const previous=orders;
          setOrders(current=>current.map(order=>order.id===id?{...order,status}:order));
          const {error:updateError}=await supabase.from("orders").update({status}).eq("id",id);
          if(updateError){setOrders(previous);toast.error("The order could not be updated. Please try again.");console.error(updateError);return;}
          toast.success(status==="confirmed" ? "Order confirmed" : "Order rejected");
        };
        const setContactRead = async (id:string,read:boolean) => {
          setContacts(current=>current.map(contact=>contact.id===id?{...contact,read}:contact));
          const {error:updateError}=await supabase.from("contacts").update({read}).eq("id",id);
          if(updateError){toast.error("Message status could not be updated.");}
        };
        const deleteContact = async (id:string) => {
          const {error:deleteError}=await supabase.from("contacts").delete().eq("id",id);
          if(deleteError){toast.error("Message could not be deleted.");return;}
          setContacts(current=>current.filter(contact=>contact.id!==id));toast.success("Message removed");
        };
        const downloadCSV = () => {
          let from=new Date(new Date().getFullYear(),new Date().getMonth(),1); let to=new Date();
          if(dateRange==="last"){from=new Date(new Date().getFullYear(),new Date().getMonth()-1,1);to=new Date(new Date().getFullYear(),new Date().getMonth(),0);}
          const rows=orders.filter(order=>{const date=new Date(order.created_at);return date>=from&&date<=to;});
          const csv=[["OrderID","Client","Cake","Type","Qty","Total","Status","Date"],...rows.map(order=>[order.reference||order.id,orderEmail(order),orderName(order),orderType(order),order.quantity||1,orderTotal(order),order.status,new Date(order.created_at).toISOString().slice(0,10)])].map(row=>row.map(value=>`"${String(value??"").replace(/"/g,'""')}"`).join(",")).join("\n");
          const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download=`gracies-report-${from.toISOString().slice(0,7)}.csv`;link.click();URL.revokeObjectURL(url);toast.success("Atelier report downloaded");
        };

        const nav=[{name:"Dashboard" as Tab,icon:LayoutDashboard},{name:"Orders" as Tab,icon:ShoppingBag},{name:"Messages" as Tab,icon:MessageSquare},{name:"Reports" as Tab,icon:Download},{name:"Users" as Tab,icon:Users},{name:"Analytics" as Tab,icon:BarChart3}];
        const StatusBadge=({status}:{status:string})=>{const style=status==="confirmed"?"bg-[#c9a86a]/15 text-[#7c5c25]":status==="rejected"?"bg-red-50 text-red-600":"bg-[#fefaf3] text-[#7c5c25]";return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style}`}><i className={`h-1.5 w-1.5 rounded-full ${status==="confirmed"?"bg-green-600":status==="rejected"?"bg-red-500":"bg-[#c9a86a]"}`}/>{status}</span>};
        const KPI=({label,value,detail,icon:Icon}:{label:string,value:string,detail:string,icon:any})=><div className="rounded-[20px] border border-[#e8d5b5] bg-white p-5 shadow-[0_20px_60px_rgba(201,168,106,.12)]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-black/60">{label}</p><p className="mt-3 font-serif text-3xl text-black">{value}</p><p className="mt-2 text-xs text-black/50">{detail}</p></div><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fefaf3] text-[#c9a86a]"><Icon size={20}/></span></div></div>;

        const OrdersView=()=> <div className="rounded-[24px] border border-[#e8d5b5] bg-white p-4 shadow-[0_20px_60px_rgba(201,168,106,.12)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-serif text-2xl text-black">Order Atelier</p><p className="mt-1 text-sm text-black/50">{filteredOrders.length} creations</p></div><div className="flex gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} className="min-w-0 flex-1 rounded-full border border-[#e8d5b5] bg-[#fefaf3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#c9a86a]/30 sm:w-52" placeholder="Search orders"/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="rounded-full border border-[#e8d5b5] bg-white px-3 py-2 text-sm"><option value="all">All</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="rejected">Rejected</option></select></div></div>
          {loading?<div className="mt-6 space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 animate-pulse rounded-2xl bg-[#fefaf3]"/>)}</div>:filteredOrders.length===0?<div className="py-16 text-center"><PackageCheck className="mx-auto text-[#c9a86a]" size={38}/><p className="mt-3 font-serif text-xl">No orders yet - Atelier awaits</p></div>:<><div className="mt-6 hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead><tr className="border-b border-[#e8d5b5] text-xs uppercase tracking-widest text-black/50"><th className="px-3 py-4">Client</th><th className="px-3 py-4">Cake</th><th className="px-3 py-4">Qty</th><th className="px-3 py-4">Total</th><th className="px-3 py-4">Delivery</th><th className="px-3 py-4">Status</th><th className="px-3 py-4">Actions</th></tr></thead><tbody>{filteredOrders.map(order=><tr key={order.id} className="border-b border-[#e8d5b5]/70"><td className="px-3 py-4">{orderEmail(order)||"Guest"}</td><td className="px-3 py-4"><strong>{orderName(order)}</strong><div className="text-xs text-black/50">{orderType(order)}</div></td><td className="px-3 py-4">{order.quantity||1}</td><td className="px-3 py-4 font-semibold">{currency(orderTotal(order))}</td><td className="px-3 py-4">{orderDateValue(order)||"—"}</td><td className="px-3 py-4"><StatusBadge status={order.status}/></td><td className="px-3 py-4"><div className="flex gap-2"><button onClick={()=>updateStatus(order.id,"confirmed")} aria-label="Confirm order" className="rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white"><CheckCircle2 size={14}/></button><button onClick={()=>updateStatus(order.id,"rejected")} aria-label="Reject order" className="rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white"><XCircle size={14}/></button></div></td></tr>)}</tbody></table></div><div className="mt-6 grid gap-3 md:hidden">{filteredOrders.map(order=><article key={order.id} className="rounded-[18px] border border-[#e8d5b5] bg-[#fefaf3] p-4"><div className="flex justify-between gap-3"><div><strong>{orderName(order)}</strong><p className="break-all text-xs text-black/50">{orderEmail(order)}</p></div><StatusBadge status={order.status}/></div><div className="mt-4 grid grid-cols-2 gap-2 text-sm"><span>Qty: {order.quantity||1}</span><strong>{currency(orderTotal(order))}</strong><span className="col-span-2 text-black/50">Delivery: {orderDateValue(order)||"—"}</span></div><div className="mt-4 flex gap-2"><button onClick={()=>updateStatus(order.id,"confirmed")} className="flex-1 rounded-full bg-green-600 px-3 py-2.5 text-xs font-semibold text-white">Confirm</button><button onClick={()=>updateStatus(order.id,"rejected")} className="flex-1 rounded-full bg-red-500 px-3 py-2.5 text-xs font-semibold text-white">Reject</button></div></article>)}</div></>}
        </div>;

        const MessagesView=()=> <div className="rounded-[24px] border border-[#e8d5b5] bg-white p-4 shadow-[0_20px_60px_rgba(201,168,106,.12)] sm:p-6"><div className="flex items-center justify-between"><div><p className="font-serif text-2xl">Atelier Messages</p><p className="text-sm text-black/50">{unread} unread</p></div><Bell className={unread?"text-[#c9a86a]":"text-black/30"} size={22}/></div>{contacts.length===0?<p className="py-16 text-center text-black/50">No messages yet - your guests will appear here.</p>:<div className="mt-6 space-y-3">{contacts.map(contact=><article key={contact.id} className={`min-w-0 rounded-[18px] border p-4 ${contact.read?"border-[#e8d5b5]":"border-[#c9a86a] bg-[#fefaf3]"}`}><div className="flex flex-col gap-3 sm:flex-row sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong>{contact.name}</strong><span className={`text-xs ${contact.read?"text-black/40":"text-[#c9a86a]"}`}>{contact.read?"Read":"Unread"}</span></div><p className="break-all text-sm text-black/50">{contact.email}</p></div><div className="flex shrink-0 gap-2"><button onClick={()=>setContactRead(contact.id,!contact.read)} className="rounded-full border border-[#e8d5b5] px-3 py-2 text-xs">{contact.read?"Mark unread":"Mark read"}</button><button onClick={()=>deleteContact(contact.id)} aria-label="Delete message" className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-500"><Trash2 size={16}/></button></div></div><button className="mt-3 max-w-full text-left text-sm leading-6 break-words" onClick={()=>setExpandedMessage(expandedMessage===contact.id?null:contact.id)}>{expandedMessage===contact.id?contact.message:contact.message.length>120?`${contact.message.slice(0,120)}…`:`${contact.message}`}</button><p className="mt-2 text-xs text-black/40">{new Date(contact.created_at).toLocaleString()}</p></article>)}</div>}</div>;
        return <ProtectedRoute><div className="min-h-screen bg-[#fefaf3] text-black">
          {sidebar&&<button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={()=>setSidebar(false)}/>}
          <aside className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[#e8d5b5] bg-white p-5 transition-transform lg:translate-x-0 ${sidebar?"translate-x-0":"-translate-x-full"}`}><div className="flex items-center justify-between"><div><p className="font-serif text-xl">Grace</p><p className="text-[10px] tracking-[.35em] text-[#c9a86a]">PATISSERIE</p></div><button className="lg:hidden" onClick={()=>setSidebar(false)}><X size={20}/></button></div><nav className="mt-10 space-y-2">{nav.map(item=><button key={item.name} onClick={()=>{setTab(item.name);setSidebar(false);}} className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${tab===item.name?"bg-[#c9a86a] text-white":"text-black/60 hover:bg-[#fefaf3]"}`}><item.icon size={18}/>{item.name}{item.name==="Messages"&&unread>0&&<span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] text-[#c9a86a]">{unread}</span>}</button>)}</nav><p className="mt-auto text-center text-xs text-black/35">Atelier Command</p></aside>
          <div className="min-w-0 lg:pl-[250px]"><header className="sticky top-0 z-30 flex min-h-[88px] items-center justify-between gap-3 border-b border-[#e8d5b5] bg-[#fefaf3]/95 px-4 backdrop-blur md:px-8"><div className="flex min-w-0 items-center gap-3"><button className="shrink-0 lg:hidden" onClick={()=>setSidebar(true)} aria-label="Open menu"><Menu/></button><div className="min-w-0"><h1 className="font-serif text-xl sm:text-3xl">Atelier Command</h1><p className="truncate text-xs text-black/45">{new Date().toLocaleDateString("en",{weekday:"long",month:"long",day:"numeric"})}</p></div></div><div className="flex shrink-0 items-center gap-2"><span className="hidden max-w-[180px] truncate text-xs text-black/60 sm:block">{adminEmail}</span><button onClick={downloadCSV} className="hidden rounded-full bg-[#c9a86a] px-4 py-2.5 text-xs font-semibold text-white sm:block"><Download className="inline mr-2" size={15}/>Download Report</button></div></header>
          <main className="min-w-0 space-y-6 p-4 md:p-8">
            {error&&<div className="break-words rounded-[18px] border border-[#e8d5b5] bg-white p-4 text-sm text-black">{error}</div>}
            {(tab==="Dashboard"||tab==="Analytics")&&<>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><KPI label="Revenue" value={currency(monthRevenue)} detail="This month" icon={Download}/><KPI label="Orders" value={String(orders.length)} detail={`${orders.filter(o=>["pending","confirmed"].includes(o.status)).length} active orders`} icon={ShoppingBag}/><KPI label="Clients" value={String(new Set([...profiles.map(p=>p.email).filter(Boolean),...orders.map(orderEmail).filter(Boolean)]).size)} detail="Unique atelier clients" icon={Users}/><KPI label="Messages" value={String(unread)} detail={`${contacts.length} total messages`} icon={Mail}/></div>
              <div className="grid gap-6 xl:grid-cols-2"><section className="min-w-0 rounded-[24px] border border-[#e8d5b5] bg-white p-5 shadow-[0_20px_60px_rgba(201,168,106,.12)]"><div className="flex justify-between"><div><p className="font-serif text-xl">Orders this week</p><p className="text-sm text-black/40">Last 7 days</p></div><span className="h-fit rounded-full bg-[#fefaf3] px-3 py-1 text-xs text-[#c9a86a]"><i className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a86a]"/>3 live viewers</span></div><div className="mt-5 h-[260px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={last7Days}><defs><linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c9a86a" stopOpacity={0.35}/><stop offset="95%" stopColor="#fefaf3" stopOpacity={0.1}/></linearGradient></defs><CartesianGrid stroke="#e8d5b5" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false}/><YAxis allowDecimals={false} axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="orders" stroke="#c9a86a" fill="url(#goldArea)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div></section><section className="min-w-0 rounded-[24px] border border-[#e8d5b5] bg-white p-5 shadow-[0_20px_60px_rgba(201,168,106,.12)]"><p className="font-serif text-xl">Most requested cakes</p><div className="mt-5 h-[260px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={cakeBreakdown} layout="vertical"><CartesianGrid stroke="#e8d5b5" horizontal={false}/><XAxis type="number" axisLine={false} tickLine={false}/><YAxis type="category" dataKey="name" width={95} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="value" fill="#c9a86a" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></div></section></div>
            </>}
            {(tab==="Dashboard"||tab==="Orders")&&<OrdersView/>}
            {tab==="Messages"&&<MessagesView/>}
            {tab==="Users"&&<section className="rounded-[24px] border border-[#e8d5b5] bg-white p-5 shadow-[0_20px_60px_rgba(201,168,106,.12)] sm:p-6"><p className="font-serif text-2xl">Atelier Guests</p><p className="text-sm text-black/50">{profiles.length} registered profiles</p><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{profiles.map(profile=><div key={profile.id} className="min-w-0 rounded-[18px] border border-[#e8d5b5] bg-[#fefaf3] p-4"><strong className="break-words">{profile.full_name||"Grace guest"}</strong><p className="break-all text-sm text-black/50">{profile.email||"—"}</p><span className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-xs text-[#c9a86a]">{profile.role||"client"}</span></div>)}</div></section>}
            {tab==="Reports"&&<section className="rounded-[24px] border border-[#e8d5b5] bg-white p-5 shadow-[0_20px_60px_rgba(201,168,106,.12)] sm:p-6"><p className="font-serif text-2xl">Atelier Reports</p><div className="mt-5 flex flex-wrap gap-2"><select value={dateRange} onChange={e=>setDateRange(e.target.value)} className="rounded-full border border-[#e8d5b5] px-4 py-2.5"><option value="month">This Month</option><option value="last">Last Month</option></select><button onClick={downloadCSV} className="rounded-full bg-[#c9a86a] px-5 py-2.5 text-sm font-semibold text-white">Download CSV</button></div></section>}
            {tab==="Analytics"&&<OrdersView/>}
          </main></div>
        </div></ProtectedRoute>;
}
