import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart, useProducts } from "../lib/store";

export const Route = createFileRoute("/shop")({
  validateSearch: (search) => ({ product: typeof search.product === "string" ? search.product : undefined }),
  component: Shop,
});

function ProductImage({ product }: { product: { id?: string; slug: string; name: string; category: string; image?: string; image_url?: string; color_theme?: string } }) {
  const [imageError, setImageError] = useState(false);
  const source = product.image_url || product.image;

  if (imageError || !source) {
    return <div className="luxury-image-placeholder bg-gradient-to-br from-[#c9a86a] to-[#e8c99a] flex items-center justify-center" role="img" aria-label={`${product.name} cake image unavailable`}>
      <span className="font-serif text-xl font-bold text-black">{product.name}</span>
    </div>;
  }

  return <img src={source} alt={product.name} onError={() => setImageError(true)} loading="eager" fetchPriority="high" decoding="async" className="w-full h-full object-cover object-center" />;
}

function Shop() {
  const [category, setCategory] = useState("All Cakes");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const { add } = useCart();
  const navigate = useNavigate();
  const { product: highlightedProduct } = Route.useSearch();
  const { products, loading, error } = useProducts();
  const categories = ["All Cakes", ...Array.from(new Set(products.map((product) => product.category)))];

  useEffect(() => {
    if (!loading && highlightedProduct) {
      document.getElementById(`cake-${highlightedProduct}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedProduct, loading, products]);

  let shown = products.filter((product) =>
    (category === "All Cakes" || product.category === category) &&
    `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase())
  );
  if (sort === "low") shown = [...shown].sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === "high") shown = [...shown].sort((a, b) => Number(b.price) - Number(a.price));

  const openProduct = (productId: string) => navigate({ to: "/product/$slug", params: { slug: productId } });
  const skeletonCards = [0, 1, 2];

  return <main className="w-full overflow-x-hidden bg-[#fffaf0]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 box-border">
      <header className="luxury-shop-header">
        <span className="tracking-[0.35em] text-[#c9a86a] text-xs font-bold">OUR ATELIER</span>
        <h1>Shop Cakes</h1>
        <p>Exceptional cakes, handcrafted for life&apos;s finest celebrations.</p>
        {!loading && !error && (
          <div className="luxury-shop-count">
            <strong>{shown.length}</strong> exquisite creations
            {category !== "All Cakes" && <span> in {category}</span>}
          </div>
        )}
      </header>
      <section className="luxury-shop-section">
        <div className="luxury-shop-toolbar">
          <label htmlFor="cake-search" className="text-black font-bold">Search Cakes</label>
          <div className="luxury-shop-controls">
            <input id="cake-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cakes..." />
            <label className="luxury-featured-select">
              <span className="sr-only">Featured selection</span>
              <select aria-label="Featured selection" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>

        {loading && <div className="luxury-shop-grid" aria-label="Loading cakes">{skeletonCards.map((item) => <div className="luxury-card-skeleton" key={item}><div /><span /><span /><span /></div>)}</div>}
        {error && <div className="luxury-shop-message" role="alert"><strong>Our collection is temporarily unavailable.</strong><p>Please refresh the page in a moment. Your cake selection has not been lost.</p></div>}
        {!loading && !error && products.length === 0 && <div className="luxury-shop-message"><strong>No cakes yet - check back soon</strong><p>Our pâtisserie is preparing something special.</p></div>}
        {!loading && !error && products.length > 0 && shown.length === 0 && <div className="luxury-shop-message"><strong>No cakes match your selection.</strong><button type="button" onClick={() => { setSearch(""); setCategory("All Cakes"); }}>Clear filters</button></div>}

        {!loading && !error && products.length > 0 && <div className="luxury-shop-layout">
          <aside className="luxury-shop-filters" aria-label="Cake categories">
            {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}
          </aside>
          <div className="luxury-shop-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {shown.map((product) => {
              const productId = String(product.id ?? product.slug);
              const isHighlighted = highlightedProduct === productId || highlightedProduct === product.slug;
              return <article id={`cake-${productId}`} className={`luxury-cake-card${isHighlighted ? " highlighted" : ""}`} key={product.slug}>
                <button className="luxury-card-image" type="button" onClick={() => openProduct(productId)} aria-label={`View ${product.name}`}>
                  <ProductImage product={product} />
                  <span className="luxury-cake-badge">{product.category}</span>
                </button>
                <div className="luxury-card-body">
                  <button type="button" className="luxury-card-title" onClick={() => openProduct(productId)}>{product.name}</button>
                  <p>{product.description}</p>
                  <div className="luxury-card-footer">
                    <strong>KES {Number(product.price).toLocaleString()}</strong>
                    <button type="button" onClick={() => add({ slug: product.slug, name: product.name, image: product.image_url || product.image, size: product.sizes[0] ?? "", flavour: product.flavours[0] ?? "", price: Number(product.price) })}>Add to Cart</button>
                  </div>
                </div>
              </article>;
            })}
          </div>
        </div>}
        <Link className="luxury-shop-link" to="/custom">Create a bespoke cake</Link>
      </section>
    </div>
  </main>;
}
