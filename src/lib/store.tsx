import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabaseClient";
import { CAKES } from "../data/cakes";

export type Product = { id?: string; slug: string; name: string; category: string; price: number; image: string; image_url?: string; color_theme?: string; description: string; flavours: string[]; sizes: string[]; sweetness?: string; frosting?: string; active?: boolean; is_active?: boolean };

const cakeImageUrls: Record<string, string> = {
  "/images/cakes/birthday.jpg": "/images/cakes/birthday.jpg",
  "/images/cakes/chocolate-fudge.jpg": "/images/cakes/chocolate-fudge.jpg",
  "/images/cakes/cupcakes.jpg": "/images/cakes/cupcakes.jpg",
  "/images/cakes/custom-floral.jpg": "/images/cakes/custom-floral.jpg",
  "/images/cakes/graduation.jpg": "/images/cakes/graduation.jpg",
  "/images/cakes/red-velvet.jpg": "/images/cakes/red-velvet.jpg",
  "/images/cakes/vanilla-berry.jpg": "/images/cakes/vanilla-berry.jpg",
  "/images/cakes/wedding-blush.jpg": "/images/cakes/wedding-blush.jpg",
  "/images/cakes/wedding-ivory.jpg": "/images/cakes/wedding-ivory.jpg",
  "/images/cakes/Tra.jpg": "/images/cakes/Tra.jpg",
  "/images/cakes/baby-shower.jpg": "/images/cakes/baby-shower.jpg",
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("products")
      .select("*")
      .then(({ data, error: queryError }) => {
        if (!active) return;
        const source = data && data.length > 0 ? data : CAKES.map((cake) => ({
          ...cake,
          image: cake.image_url,
          category: cake.category === "Chocolate" ? "Chocolate Lovers" : cake.category,
          active: true,
        }));
        const visible = source
          .map((product) => {
            const record = product as Product;
            const resolvedImage = record.image_url || cakeImageUrls[record.image] || record.image;
            return {
              ...record,
              image: resolvedImage,
              flavours: Array.isArray(record.flavours) ? record.flavours.map(String) : [],
              sizes: Array.isArray(record.sizes) ? record.sizes.map(String) : [],
              image_url: resolvedImage,
            };
          })
          .filter((product) => {
            const record = product as Product;
            return record.active !== false && record.is_active !== false;
          })
          .sort((a, b) => (Number((a as Product & { sort_order?: number }).sort_order ?? 0) - Number((b as Product & { sort_order?: number }).sort_order ?? 0)));
        setProducts(visible);
        setError(queryError?.message ?? null);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { products, loading, error };
}
export type CartItem = { key: string; slug: string; name: string; image: string; size: string; flavour: string; price: number; quantity: number };
type CartContextValue = { cart: CartItem[]; add: (item: Omit<CartItem,"key"|"quantity"> & {quantity?:number})=>void; setQuantity:(key:string,q:number)=>void; remove:(key:string)=>void; clear:()=>void; count:number; total:number };
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({children}:{children:ReactNode}) { const [cart,setCart]=useState<CartItem[]>([]); useEffect(()=>{try{setCart(JSON.parse(localStorage.getItem("sweet-serenity-cart")||"[]"))}catch{}},[]); useEffect(()=>{localStorage.setItem("sweet-serenity-cart",JSON.stringify(cart))},[cart]); const add=(item:Omit<CartItem,"key"|"quantity">&{quantity?:number})=>{const quantity=item.quantity||1; const key=`${item.slug}-${item.size}-${item.flavour}`; setCart(old=>{const found=old.find(i=>i.key===key); return found?old.map(i=>i.key===key?{...i,quantity:i.quantity+quantity}:i):[...old,{...item,key,quantity}]})}; const setQuantity=(key:string,q:number)=>setCart(old=>q<=0?old.filter(i=>i.key!==key):old.map(i=>i.key===key?{...i,quantity:q}:i)); const remove=(key:string)=>setCart(old=>old.filter(i=>i.key!==key)); const clear=()=>setCart([]); const count=cart.reduce((n,i)=>n+i.quantity,0); const total=cart.reduce((n,i)=>n+i.price*i.quantity,0); return <CartContext.Provider value={{cart,add,setQuantity,remove,clear,count,total}}>{children}</CartContext.Provider> }
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error("useCart requires CartProvider");return value}
