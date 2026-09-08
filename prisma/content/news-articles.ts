/**
 * News article content for 211Motors.
 *
 * Lives outside prisma/seed.ts because that file calls `main()` at module load,
 * so it cannot be imported from. Keeping the copy here means the seed and any
 * one-off content migration publish exactly the same text instead of drifting.
 *
 * `body` is HTML. It is sanitized with DOMPurify both on save
 * (lib/actions/news.ts) and again on render (news/[slug]/page.tsx), so keep to
 * ordinary prose tags — p, h2, ul/li, strong, em.
 */
import { placeholderImage } from "./placeholder-image";

export const newsArticles = [
    {
      // Slug kept deliberately: next.config.ts 308s the old
      // "exceed-limited-now-open-in-juba-town" URL here.
      slug: "211motors-now-open-in-juba-town",
      title: "211Motors Opens Its Doors in Juba Town",
      excerpt:
        "Our Juba Town showroom is now open — the sole authorized home of Soueast and 212 vehicles in South Sudan and Sudan, with genuine parts and factory-trained service under the same roof.",
      body: [
        "<p>211Motors is now open in Juba Town, near Muduria Roundabout. In partnership with FBM International Co., we are the sole authorized distributor of Soueast and 212 vehicles in South Sudan and Sudan — which means every vehicle on our floor arrives through the manufacturer, not through a grey import chain.</p>",
        "<h2>What you will find on the floor</h2>",
        "<p>The full Soueast range is represented: the compact <strong>S05</strong>, the <strong>S06</strong> crossover and its plug-in hybrid sibling the <strong>S06 DM</strong>, the family-sized <strong>S07</strong>, and the seven-seat flagship <strong>S09</strong>. Alongside them sit the two 212 off-roaders — the retro-styled <strong>T01</strong> and the ladder-frame <strong>T02</strong>.</p>",
        "<h2>More than a showroom</h2>",
        "<p>Buying a vehicle is the easy part; keeping it running is what matters over the following decade. That is why the showroom opened with three other departments already staffed:</p>",
        "<ul>",
        "<li><strong>Service</strong> — factory-trained technicians working to manufacturer schedules, so your warranty stays intact.</li>",
        "<li><strong>Parts</strong> — genuine Soueast and 212 components ordered through the manufacturer.</li>",
        "<li><strong>Fleet &amp; Corporate</strong> — a dedicated desk for NGOs, ministries, and businesses buying more than one vehicle.</li>",
        "</ul>",
        "<h2>Come and see us</h2>",
        "<p>We are open Monday to Saturday, 8:00 AM to 6:00 PM, and closed on Sunday. You are welcome to walk in, but booking a test drive ahead of time means the vehicle you want to drive is ready and waiting when you arrive.</p>",
      ].join(""),
      coverImageUrl: placeholderImage("211Motors Showroom Opening"),
      tags: ["announcement", "showroom"],
      status: "PUBLISHED" as const,
      // REPLACE BEFORE GO-LIVE: placeholder date — set the real opening date.
      publishedAt: new Date("2026-05-01"),
      metaTitle: "211Motors Opens in Juba Town | Soueast & 212 South Sudan",
      metaDescription:
        "The 211Motors showroom is open in Juba Town, near Muduria Roundabout — sole authorized distributor of Soueast and 212 vehicles in South Sudan and Sudan.",
    },
    {
      slug: "soueast-range-explained-s05-to-s09",
      title: "The Soueast Range, Explained: S05 to S09",
      excerpt:
        "Five SUVs, one badge, and a fair amount of overlap. Here is how the Soueast S05, S06, S06 DM, S07 and S09 actually differ — and which one suits which driver.",
      body: [
        "<p>Walk into the showroom and the Soueast range can look like five variations on the same idea. They are not. Each model is aimed at a different buyer, and the differences that matter are rarely the ones on the spec sheet. Here is the honest version.</p>",
        "<h2>S05 — the compact one</h2>",
        "<p>A five-seat compact urban SUV. The S05 is the easiest of the range to park, the cheapest to run, and the one we most often recommend to first-time SUV buyers and to households looking for a second vehicle for Juba city driving.</p>",
        "<h2>S06 and S06 DM — the crossovers</h2>",
        "<p>The S06 is a C-segment urban crossover: more road presence than the S05, still comfortable in traffic. The <strong>S06 DM</strong> is the same car with a plug-in hybrid powertrain, and it is the interesting one. If most of your driving is short city trips with occasional longer runs, it can spend a large share of its life on electric power while keeping a petrol engine for the days that need it — no range anxiety on routes where charging is not yet a given.</p>",
        "<h2>S07 — the family SUV</h2>",
        "<p>A five-seat C-segment family SUV, and the middle of the range in every sense. If you are carrying children, luggage, and the occasional rough road, this is usually the model that ends up making sense.</p>",
        "<h2>S09 — the flagship</h2>",
        "<p>Seven seats. The S09 is the one to look at when five is genuinely not enough — larger families, or businesses moving staff. Note that the third row changes how you should think about luggage space; come and sit in it before deciding.</p>",
        "<h2>How to choose</h2>",
        "<p>The specification sheet will not settle this for you. Bring the load you actually carry — the car seats, the equipment, the passengers — and put it in the boot of two or three of them. Our sales team can arrange back-to-back test drives so you feel the difference rather than reading about it.</p>",
      ].join(""),
      coverImageUrl: placeholderImage("Soueast Range S05 to S09"),
      tags: ["buying-guide", "soueast"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-06-10"),
      metaTitle: "Soueast Range Compared: S05, S06, S06 DM, S07, S09",
      metaDescription:
        "A practical guide to the five Soueast SUVs sold by 211Motors in South Sudan and Sudan — how the S05, S06, S06 DM, S07 and S09 differ and who each one suits.",
    },
    {
      slug: "212-t01-and-t02-built-for-unpaved-roads",
      title: "212 T01 and T02: Built for the Roads We Actually Have",
      excerpt:
        "Most SUVs are designed for tarmac and styled to look capable. The 212 T01 and T02 are the other way round — and that difference shows up somewhere past the edge of the city.",
      body: [
        "<p>There is a category of vehicle that looks rugged in a showroom and struggles the first time the tarmac runs out. The 212 range is not in it. Both models 211Motors sells are built around off-road capability first, with the styling following from the engineering rather than the reverse.</p>",
        "<h2>212 T01 — retro-styled, seriously capable</h2>",
        "<p>A five-seat, retro-styled off-road SUV. The upright shape is not nostalgia for its own sake: it buys visibility over the bonnet, generous approach and departure angles, and an interior that is easy to clean out after a working week.</p>",
        "<h2>212 T02 — the flagship</h2>",
        "<p>The T02 is the flagship of the range and, importantly, a <strong>ladder-frame</strong> vehicle. That construction is why it is the one we point fleet, NGO, and expedition buyers towards: a separate frame handles sustained punishment on unpaved routes better than a monocoque, and it is more straightforward to repair when something does give way a long way from a workshop.</p>",
        "<h2>Why this matters here</h2>",
        "<p>Between Juba and most upcountry sites, road surface is the variable that determines whether a vehicle lasts three years or ten. A vehicle chosen for a showroom forecourt and a vehicle chosen for the route to a field site are not the same purchase, and we would rather sell you the second one.</p>",
        "<p>Both 212 models carry the same factory warranty and genuine-parts guarantee as every Soueast vehicle we sell. If you are speccing vehicles for fleet use, our Fleet &amp; Corporate desk can talk through duty cycles and service intervals before you commit.</p>",
      ].join(""),
      coverImageUrl: placeholderImage("212 T01 and T02 Off-Road"),
      tags: ["212", "off-road", "fleet"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-08-01"),
      metaTitle: "212 T01 & T02 Off-Road SUVs | 211Motors South Sudan",
      metaDescription:
        "The 212 T01 and ladder-frame T02 are built for unpaved roads and fleet duty across South Sudan and Sudan, sold and serviced by 211Motors in Juba.",
    },
    {
      slug: "genuine-parts-and-factory-warranty",
      title: "Genuine Parts and a Factory Warranty: What You Actually Get",
      excerpt:
        "A grey-market part is cheaper on the day you buy it. Here is what it costs you afterwards — and what being an authorized distributor changes about the answer.",
      body: [
        "<p>The most common question we are asked is not about horsepower or trim levels. It is some version of: <em>if this breaks in two years, can I get the part?</em> It is the right question, and it deserves a straight answer.</p>",
        "<h2>What being the authorized distributor changes</h2>",
        "<p>211Motors is the sole authorized distributor of Soueast and 212 vehicles in South Sudan and Sudan. In practice that means our parts come down the manufacturer's own supply chain. A component fitted in our workshop is the component the vehicle was engineered around — the same specification, the same tolerances, the same expected service life.</p>",
        "<h2>The real cost of a grey-market part</h2>",
        "<p>A non-genuine part is usually cheaper at the counter. The expense arrives later, in three ways:</p>",
        "<ul>",
        "<li><strong>It may not last.</strong> Parts that look identical are often manufactured to a different standard, and the failure tends to come at the least convenient moment.</li>",
        "<li><strong>It can take other components with it.</strong> A part that fails outside its design envelope rarely fails alone.</li>",
        "<li><strong>It can affect your warranty.</strong> Damage traced to a non-genuine component is not something a manufacturer will cover.</li>",
        "</ul>",
        "<h2>Servicing that keeps the warranty intact</h2>",
        "<p>Our workshop is staffed by factory-trained technicians working to the manufacturer's service schedules, and the work is recorded. That record is what protects you in a warranty claim: a documented service history using genuine parts leaves nothing to argue about.</p>",
        "<h2>Ordering parts</h2>",
        "<p>You do not need to have bought the vehicle from us to buy parts from us. Our Parts department can source components for any Soueast or 212 vehicle in the country — contact them with your VIN or stock number and they will confirm the correct part before you commit to anything.</p>",
      ].join(""),
      coverImageUrl: placeholderImage("Genuine Parts and Warranty"),
      tags: ["service", "parts", "ownership"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-07-01"),
      metaTitle: "Genuine Parts & Factory Warranty | 211Motors Juba",
      metaDescription:
        "Why 211Motors fits only genuine Soueast and 212 parts, what a grey-market component really costs, and how factory-trained servicing protects your warranty.",
    },
];
