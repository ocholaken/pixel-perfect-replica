import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "../lib/store";
export const Route=createFileRoute("/confirmation")({validateSearch:(s)=>({reference:String(s.reference||"")}),component:Confirmation});
function Confirmation(){const {reference}=Route.useSearch();const {clear}=useCart();const [cleared,setCleared]=useState(false);useEffect(()=>{if(!cleared){clear();setCleared(true)}},[clear,cleared]);return <section className="section empty"><div style={{fontSize:60,color:"#C6A15B"}}>✓</div><span className="eyebrow">Order received</span><h1 className="page-title">Thank you for celebrating with us</h1><p>Your order reference is <strong>{reference}</strong>.</p><p>Our team will review your order and contact you to confirm availability and payment.</p><Link className="btn btn-primary" to="/account">Track Your Order</Link></section>}
