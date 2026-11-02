import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart, useProducts } from "../lib/store";

export const Route = createFileRoute("/product/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = Route.useParams();
  const { products, loading } = useProducts();
  const product = products.find((item) => item.slug === slug || item.id === slug);
  const [size, setSize] = useState("");
  const [flavour, setFlavour] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    if (product) {
      setSize(product.sizes[0] ?? "");
      setFlavour(product.flavours[0] ?? "");
    }
  }, [product]);

  if (loading) return <section className="section"><p>Loading cake...</p></section>;
  if (!product) return <section className="section"><h1 className="page-title">Cake not found</h1><Link className="btn" to="/shop">Back to cakes</Link></section>;

  return <section className="section">
    <Link to="/shop" style={{ color: "#9a6d2f" }}>← Back to cakes</Link>
    <div className="detail-layout" style={{ marginTop: 25 }}>
      <img className="detail-image" src={product.image} alt={product.name} />
      <div className="detail-content">
        <span className="eyebrow">{product.category}</span><h1>{product.name}</h1>
        <div className="price" style={{ fontSize: 24 }}>KES {Number(product.price).toLocaleString()}</div>
        <p>{product.description}</p>
        <div className="option-grid">
          <div><label>Size</label><select value={size} onChange={(event) => setSize(event.target.value)}>{product.sizes.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div><label>Flavour</label><select value={flavour} onChange={(event) => setFlavour(event.target.value)}>{product.flavours.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div><label>Quantity</label><input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, +event.target.value))} /></div>
        </div>
        <button className="btn btn-primary" onClick={() => add({ slug: product.slug, name: product.name, image: product.image, size, flavour, price: Number(product.price), quantity })}>Add to Cart — KES {(Number(product.price) * quantity).toLocaleString()}</button>
      </div>
    </div>
  </section>;
}
