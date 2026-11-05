import { Link } from "@tanstack/react-router";
import { CakeSlice, Menu, ShoppingBag, X } from "lucide-react";
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
 return <header className={`site-header ${scrolled?"scrolled":""}`}><Link to="/" className="brand" aria-label="Grace Patisserie home"><span className="brand-mark"><CakeSlice size={22}/></span><span><strong>GRACE</strong><small>PATISSERIE</small></span></Link><button className="menu-button" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button><nav className={open?"nav open":"nav"} onClick={()=>setOpen(false)}><Link to="/">Home</Link><Link to="/shop">Shop Cakes</Link><Link to="/custom">Custom Cakes</Link><a href="/#about">About Us</a><a href="/#contact">Contact</a><a href="https://wa.me/254713380906?text=Hello%20Grace%20Patisserie!%20I%20have%20a%20question%20about%20your%20cakes." target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">WhatsApp</a>{user?<>{adminUser && <Link to="/admin" className="admin-dashboard-link">Admin Dashboard</Link>}<Link to="/account">Hi, {displayName || "Member"}</Link><button type="button" onClick={handleLogout}>Logout</button></>:<Link to="/account">Login</Link>}</nav><Link to="/cart" className="cart-link" aria-label={`Shopping cart with ${count} items`}><ShoppingBag/><span className={bumped?"cart-bump":""}>{count}</span></Link></header>
}
export function Footer(){
 const [newsletterJoined,setNewsletterJoined]=useState(false);
 const subscribe=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();setNewsletterJoined(true)};
 return <><footer className="footer"><div><div className="brand footer-brand"><span className="brand-mark"><CakeSlice size={22}/></span><span><strong>GRACE</strong><small>PATISSERIE</small></span></div><p>Handcrafted cakes for life's sweetest moments.</p></div><div><h4>Explore</h4><Link to="/shop">Shop Cakes</Link><Link to="/custom">Custom Orders</Link><Link to="/account">My Account</Link></div><div><h4>Visit us</h4><p>Mon–Sat, 8am–6pm</p><a href="tel:+254713380906">0713 380 906</a><a href="mailto:hello@gracepatisserie.co.ke">hello@gracepatisserie.co.ke</a></div><div><h4>Stay sweet</h4><p>News and seasonal collections, occasionally.</p>{newsletterJoined?<p className="newsletter-success" role="status">Thank you — you are on our list.</p>:<form className="newsletter" onSubmit={subscribe}><input required aria-label="Email address" type="email" placeholder="Email address"/><button>Join</button></form>}</div></footer><FooterContact /><div className="footer-bottom">© {new Date().getFullYear()} Grace Patisserie. Made with care.</div></>
}
export function SiteLayout({children}:{children:any}){return <><Header/><main>{children}</main><Footer/></>}
