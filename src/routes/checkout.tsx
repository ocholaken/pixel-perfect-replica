import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { useCart } from "../lib/store";
import { supabase } from "../lib/supabaseClient";
import { ProtectedRoute } from "../components/auth-route";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
export const Route=createFileRoute("/checkout")({component:Checkout});
function Checkout(){const {cart,total}=useCart();const {user}=useAuth();const navigate=useNavigate();const [method,setMethod]=useState("mpesa");const [loading,setLoading]=useState(false);const [error,setError]=useState("");
const submit=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const data=new FormData(e.currentTarget);const name=String(data.get("name")||"").trim() || "Sweet Serenity Customer";const phone=String(data.get("phone")||"").trim();const email=String(data.get("email")||"").trim();const orderDate=String(data.get("date")||"");if(!phone||!email||!orderDate)return;setLoading(true);setError("");
const reference=`SS-${Date.now().toString().slice(-8)}`;
const {data:customer,error:customerError}=await supabase.from("customers").upsert({email,name,full_name:name,phone},{onConflict:"email"}).select("id").single();
if(customerError){setError(customerError.message);setLoading(false);return}
const cakeName=cart[0]?.name || "Cake Order";
const orderEmail=(user?.email || email).trim().toLowerCase();
const orderItems=cart.map(item=>({slug:item.slug,name:item.name,size:item.size,flavour:item.flavour,quantity:item.quantity,price:item.price}));
const primaryOrder={user_email:orderEmail,user_name:name,cake_name:cakeName,items:orderItems,total_price:total,status:"pending"};
let {error:orderError}=await supabase.from("orders").insert(primaryOrder);
if(orderError && /column .*orders|schema cache/i.test(orderError.message)){
  ({error:orderError}=await supabase.from("orders").insert({user_email:orderEmail,total_price:total,status:"pending"}));
}
if(orderError){setError(orderError.message);setLoading(false);return}
sessionStorage.setItem("sweet-serenity-last-order",JSON.stringify({reference,name,payment:method,total}));
toast.success("Your order has been placed with the atelier.");
await navigate({to:"/account"});
};if(!cart.length)return <section className="section empty"><h1 className="page-title">Nothing to check out</h1></section>;return <ProtectedRoute><section className="section"><h1 className="page-title">Checkout</h1><div className="checkout-layout"><form className="account-card" onSubmit={submit}><h2>Delivery details</h2><div className="form-grid"><label className="full">Full name<input required name="name" className="form-control"/></label><label>Phone number<input required name="phone" type="tel" pattern="^(\+254|254|0)[0-9]{9}$" placeholder="0712345678" className="form-control"/></label><label>Email address<input required name="email" type="email" className="form-control"/></label><label>Fulfilment<select className="form-control" name="fulfilment"><option>Delivery</option><option>Collection</option></select></label><label>Delivery location<input name="location" className="form-control"/></label><label className="full">Preferred date<input required name="date" type="date" className="form-control"/></label><label className="full">Preferred collection time<input name="pickup_time" type="time"/></label><label className="full">Instructions<textarea name="instructions" rows={3} className="form-control"/></label></div><h2>Payment</h2><label><input type="radio" checked={method==="mpesa"} onChange={()=>setMethod("mpesa")}/> M-PESA STK Push</label>{error&&<div className="notice">{error}</div>}<button disabled={loading} className="btn btn-primary" style={{width:"100%",marginTop:20}}>{loading?"Placing order...":"Place Order"}</button></form><aside className="summary"><h2>Your order</h2>{cart.map(i=><div className="summary-line" key={i.key}><span>{i.quantity} × {i.name}</span><span>KES {(i.price*i.quantity).toLocaleString()}</span></div>)}<hr/><div className="summary-line"><strong>Total</strong><strong>KES {total.toLocaleString()}</strong></div></aside></div></section></ProtectedRoute>}
