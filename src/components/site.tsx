import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Menu, Music2, Phone, ShoppingBag, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useCart } from "../lib/store";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { FooterContact } from "./FooterContact";
import { isAdmin } from "../lib/admin";

export function Header(){
 const {count}=useCart();const {user,profile}=useAuth();const [open,setOpen]=useState(false);const [scrolled,setScrolled]=useState(false);const [bumped,setBumped]=useState(false);const previousCount=useRef(count);
 useEffect(()=>{const update=()=>setScrolled(window.scrollY>18);update();window.addEventListener("scroll",update,{passive:true});return()=>window.removeEventListener("scroll",update)},[]);
 useEffect(()=>{if(count>previousCount.current){setBumped(true);window.setTimeout(()=>setBumped(false),420)}previousCount.current=count},[count]);
 const handleLogout=async()=>{await supabase.auth.signOut();sessionStorage.clear();localStorage.removeItem("supabase.auth.token");toast.success("Logged out");setOpen(false);window.location.href="/login"};
 const displayName=profile?.full_name?.trim().split(/\s+/)[0];
 const adminUser=isAdmin(user?.email);
 return <header className={`site-header ${scrolled?"scrolled":""}`}><Link to="/" className="brand brand-logo" aria-label="Sweet Serenity home"><img src="/images/cakes/Logo.jpeg" alt="Sweet Serenity" /></Link><button className="menu-button" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button><nav className={open?"nav open":"nav"} onClick={()=>setOpen(false)}><Link to="/">Home</Link><Link to="/shop">Shop Cakes</Link><Link to="/custom">Custom Cakes</Link><Link to="/" hash="about" aria-label="View Sweet Serenity About Us">About Us</Link><Link to="/" hash="contact">Contact</Link><a href="https://wa.me/254713808906?text=Hello%20Sweet%20Serenity!%20I%20have%20a%20question%20about%20your%20cakes." target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">WhatsApp</a>{user?<>{adminUser && <Link to="/admin" className="admin-dashboard-link">Admin Dashboard</Link>}<Link to="/account">Hi, {displayName || "Member"}</Link><button type="button" onClick={handleLogout}>Logout</button></>:<Link to="/account">Login</Link>}</nav><Link to="/cart" className="cart-link" aria-label={`Shopping cart with ${count} items`}><ShoppingBag/><span className={bumped?"cart-bump":""}>{count}</span></Link></header>
}
export function Footer(){
 const [newsletterJoined,setNewsletterJoined]=useState(false);
 const subscribe=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();setNewsletterJoined(true)};
 return <><footer className="footer"><div><Link to="/" className="brand brand-logo footer-brand" aria-label="Sweet Serenity home"><img src="/images/cakes/Logo.jpeg" alt="Sweet Serenity" /></Link><p>Handcrafted cakes for life's sweetest moments.</p><div className="social-links" aria-label="Sweet Serenity social links"><a href="https://www.facebook.com/SweetSerenitySiaya" target="_blank" rel="noreferrer" aria-label="Sweet Serenity Siaya on Facebook"><Facebook size={18}/></a><a href="https://www.instagram.com/sweetserenity/" target="_blank" rel="noreferrer" aria-label="@sweetserenity on Instagram"><Instagram size={18}/></a><a href="https://www.tiktok.com/@sweetserenity" target="_blank" rel="noreferrer" aria-label="@sweetserenity on TikTok"><Music2 size={18}/></a><a href="tel:+254713808906" aria-label="Call Sweet Serenity"><Phone size={18}/></a></div></div><div><h4>Explore</h4><Link to="/shop">Shop Cakes</Link><Link to="/custom">Custom Orders</Link><Link to="/account">My Account</Link></div><div><h4>Visit us</h4><p>Siaya County, Yala, Kenya</p><p>Mon–Sat, 8am–6pm</p><a href="tel:+254713808906">0713 808 906</a></div><div><h4>Follow our journey</h4><p>Sweet creations, celebrations and daily inspiration.</p><div className="social-details"><a href="https://www.instagram.com/sweetserenity/" target="_blank" rel="noreferrer">@sweetserenity · Instagram</a><a href="https://www.tiktok.com/@sweetserenity" target="_blank" rel="noreferrer">@sweetserenity · TikTok</a><a href="https://www.facebook.com/SweetSerenitySiaya" target="_blank" rel="noreferrer">Sweet Serenity Siaya · Facebook</a></div></div></footer><FooterContact /><div className="footer-bottom">© {new Date().getFullYear()} Sweet Serenity. Crafted with love in Yala.</div></>
}
export function SiteLayout({children}:{children:any}){return <><Header/><main>{children}</main><Footer/></>}
