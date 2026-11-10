import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/menu")({ component: MenuPage });

const STANDARD_FLAVOURS = [
  "Vanilla",
  "Orange",
  "Pineapple",
  "Strawberry",
  "Blueberry",
  "Passion",
  "Coconut",
  "Lemon",
  "Raspberry",
  "Bubblegum",
  "Blackcurrant",
  "Mango",
  "Piña Colada",
];

const PREMIUM_FLAVOURS = [
  "Orange / Chocolate",
  "Vanilla / Mint",
  "Vanilla / Chocochip",
  "Cookies / Cream",
  "Red Velvet / Chocolate",
  "Chocolate / Mint",
  "Black Forest",
];

type PriceRow = { size: string; price: number };

const STANDARD_PRICES: PriceRow[] = [
  { size: "1 kg", price: 2000 },
  { size: "1.5 kg", price: 3000 },
  { size: "2 kg", price: 3800 },
  { size: "2.5 kg", price: 5000 },
  { size: "3 kg", price: 5800 },
];

const PREMIUM_PRICES: PriceRow[] = [
  { size: "1 kg", price: 2800 },
  { size: "1.5 kg", price: 4000 },
  { size: "2 kg", price: 5400 },
  { size: "2.5 kg", price: 6800 },
  { size: "3 kg", price: 8400 },
];

const WEDDING_TIERS = [
  {
    name: "Silver Tier",
    weight: "5KG",
    mainCake: "3 tier main cake (3kg)",
    cakeStand: "Cake stand",
    price: 12500,
    fondantPrice: 14000,
  },
  {
    name: "Diamond Tier",
    weight: "7KG",
    mainCake: "3 tier main cake (5kg)",
    cakeStand: "Cake stands",
    price: 16900,
    fondantPrice: 20500,
  },
  {
    name: "Gold Tier",
    weight: "10KG",
    mainCake: "4 tier main cake (8kgs)",
    cakeStand: "Cake stands",
    price: 23500,
    fondantPrice: 26000,
  },
];

const WEDDING_EXTRAS = ["2 side cakes", "Non alcoholic wine"];

function formatPrice(price: number) {
  return `KES ${price.toLocaleString("en-KE")}`;
}

function PriceTable({ rows }: { rows: PriceRow[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-[#E5D7BB]">
      <table className="w-full min-w-[320px] text-left text-sm">
        <thead className="bg-[#2B2118] text-white">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">
              Cake size
            </th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.size} className="border-t border-[#F0E6D4] odd:bg-white even:bg-[#FFFDF9]">
              <th scope="row" className="px-5 py-3 font-medium">
                {row.size}
              </th>
              <td className="px-5 py-3 text-right font-bold">{formatPrice(row.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlavourList({ flavours }: { flavours: string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2">
      {flavours.map((flavour) => (
        <li key={flavour} className="rounded-full bg-[#FFF8F0] px-3 py-2 text-sm text-[#5F4B36]">
          {flavour}
        </li>
      ))}
    </ul>
  );
}

function WeddingPriceTable({ fondant = false }: { fondant?: boolean }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-[#E5D7BB]">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="bg-[#2B2118] text-white">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Package
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Includes
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {WEDDING_TIERS.map((tier) => (
            <tr
              key={tier.name}
              className="border-t border-[#F0E6D4] align-top odd:bg-white even:bg-[#FFFDF9]"
            >
              <th scope="row" className="whitespace-nowrap px-4 py-4 font-semibold">
                {tier.name}
                <span className="mt-1 block text-xs font-normal text-[#756858]">
                  ({tier.weight})
                </span>
              </th>
              <td className="px-4 py-4 text-[#5F4B36]">
                <ul className="space-y-1">
                  {[tier.mainCake, ...WEDDING_EXTRAS, tier.cakeStand, "Cutlery"].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-right font-bold">
                {formatPrice(fondant ? tier.fondantPrice : tier.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MenuPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F0] px-4 py-14 text-[#2B2118]">
      <div className="mx-auto max-w-[1000px]">
        <header className="text-center">
          <p className="text-[11px] font-bold tracking-[0.38em] text-[#C9A86A]">
            THE COMPLETE COLLECTION
          </p>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">Atelier Menu</h1>
          <p className="mt-4 text-[#756858]">
            Cakes, pastries and breads prepared fresh at Sweet Serenity.
          </p>
        </header>

        <section
          aria-labelledby="standard-heading"
          className="mt-12 rounded-[28px] border border-[#E5D7BB] bg-white p-6 shadow-[0_18px_60px_rgba(92,67,35,.08)] md:p-8"
        >
          <p className="text-[10px] font-bold tracking-[0.28em] text-[#C9A86A]">
            CELEBRATION CAKES
          </p>
          <h2 id="standard-heading" className="mt-2 font-serif text-3xl">
            Standard Cake Flavours
          </h2>
          <p className="mt-2 text-sm text-[#756858]">
            Choose a flavour for birthdays and every celebration. Cake photos show design
            inspiration; use the price list below for your selected flavour and size.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-2xl border border-[#E5D7BB]">
              <img
                src="/images/cakes/birthday.jpg"
                alt="Existing Sweet Serenity birthday cake design"
                className="h-56 w-full object-cover"
                loading="lazy"
              />
              <figcaption className="px-4 py-3 text-sm font-medium">
                Birthday cake design inspiration
              </figcaption>
            </figure>
            <figure className="overflow-hidden rounded-2xl border border-[#E5D7BB]">
              <img
                src="/images/cakes/vanilla-berry.jpg"
                alt="Existing vanilla sponge cake with raspberry topping"
                className="h-56 w-full object-cover"
                loading="lazy"
              />
              <figcaption className="px-4 py-3 text-sm font-medium">
                Vanilla and raspberry cake inspiration
              </figcaption>
            </figure>
          </div>

          <FlavourList flavours={STANDARD_FLAVOURS} />
          <PriceTable rows={STANDARD_PRICES} />
          <ul className="mt-5 space-y-2 text-sm leading-6 text-[#756858]">
            <li>Mix and match up to three flavours in one cake.</li>
            <li>Cake fillings are charged separately and are not included.</li>
            <li>Cake topper customization: KES 300 extra.</li>
            <li>50% deposit to confirm all orders.</li>
            <li>Pay via M-PESA Till Number: 3297470.</li>
            <li>Delivery is available at extra cost depending on location.</li>
          </ul>
        </section>

        <section
          aria-labelledby="premium-heading"
          className="mt-8 rounded-[28px] border border-[#E5D7BB] bg-white p-6 shadow-[0_18px_60px_rgba(92,67,35,.08)] md:p-8"
        >
          <p className="text-[10px] font-bold tracking-[0.28em] text-[#C9A86A]">
            A SEPARATE PRICE LIST
          </p>
          <h2 id="premium-heading" className="mt-2 font-serif text-3xl">
            Premium Cake Flavours
          </h2>
          <p className="mt-2 text-sm text-[#756858]">
            Premium flavours are priced separately from Standard cakes.
          </p>
          <FlavourList flavours={PREMIUM_FLAVOURS} />
          <PriceTable rows={PREMIUM_PRICES} />
          <ul className="mt-5 space-y-2 text-sm leading-6 text-[#756858]">
            <li>
              Fillings available at an added cost: Salted Caramel, Lemon Curd, Blueberry and
              Strawberry.
            </li>
            <li>Prices are exclusive of delivery fee.</li>
            <li>Non-edible toppers: KES 300.</li>
            <li>Edible toppers: KES 300 for A5 and KES 600 for A4.</li>
            <li>50% deposit to confirm.</li>
          </ul>
        </section>

        <section
          aria-labelledby="wedding-heading"
          className="mt-8 rounded-[28px] border border-[#E5D7BB] bg-white p-6 shadow-[0_18px_60px_rgba(92,67,35,.08)] md:p-8"
        >
          <p className="text-[10px] font-bold tracking-[0.28em] text-[#C9A86A]">
            WEDDING CELEBRATIONS
          </p>
          <h2 id="wedding-heading" className="mt-2 font-serif text-3xl">
            Traditional Wedding Cake Packages
          </h2>
          <p className="mt-2 text-sm text-[#756858]">
            CHOOSE THE ONE THAT&apos;S PERFECT FOR YOUR LOVE STORY!
          </p>

          <figure className="mt-6 max-w-md overflow-hidden rounded-2xl border border-[#E5D7BB]">
            <img
              src="/images/cakes/custom-floral.jpg"
              alt="Existing floral tiered wedding cake design"
              className="h-64 w-full object-cover"
              loading="lazy"
            />
            <figcaption className="px-4 py-3 text-sm font-medium">
              Floral wedding cake design inspiration
            </figcaption>
          </figure>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-[#E5D7BB] p-5">
              <h3 className="font-serif text-2xl">CREAM CAKES</h3>
              <WeddingPriceTable />
            </article>
            <article className="rounded-2xl border border-[#E5D7BB] p-5">
              <h3 className="font-serif text-2xl">FONDANT CAKES</h3>
              <WeddingPriceTable fondant />
            </article>
          </div>
          <ul className="mt-6 space-y-2 text-sm leading-6 text-[#756858]">
            <li>Edible flowers are charged separately.</li>
            <li>Transport is charged separately.</li>
            <li>The quotation covers assorted flavours only; fruit cakes are quoted separately.</li>
          </ul>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {["Fresh Pastries", "Butter Croissants", "Artisan Breads"].map((item) => (
            <div
              key={item}
              className="rounded-[22px] border border-[#E5D7BB] bg-white p-6 text-center shadow-sm"
            >
              <h2 className="font-serif text-2xl">{item}</h2>
              <p className="mt-2 text-sm text-[#756858]">Available for daily atelier collection.</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
