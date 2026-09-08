/**
 * Idempotent seed script — safe to re-run (`npm run db:seed`). Creates:
 * one SUPER_ADMIN (mirrored from a real Supabase Auth user), site settings,
 * the five Soueast models plus two 212 off-road models with variants/colors/
 * specs/features, inventory units, news articles, and testimonials — per
 * spec §9.
 *
 * Placeholder imagery uses placehold.co so the seed has no dependency on real
 * car photography; replace with genuine photos before go-live (see README
 * "Before go-live").
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient, type Prisma } from "@prisma/client";
import { placeholderImage } from "./content/placeholder-image";
import { newsArticles } from "./content/news-articles";

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = process.env.SEED_SUPER_ADMIN_EMAIL ?? "admin@211motors.com";
const SUPER_ADMIN_PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD ?? "Johnlat@2026";


async function seedSuperAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to seed the super admin.",
    );
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Idempotent: look for an existing auth user with this email first.
  let authUserId: string | null = null;
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find((u) => u.email === SUPER_ADMIN_EMAIL);

  if (existing) {
    authUserId = existing.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new Error(`Failed to create super admin auth user: ${error?.message}`);
    }
    authUserId = data.user.id;
  }

  await prisma.user.upsert({
    where: { id: authUserId },
    update: { email: SUPER_ADMIN_EMAIL, role: "SUPER_ADMIN", isActive: true },
    create: {
      id: authUserId,
      email: SUPER_ADMIN_EMAIL,
      fullName: "211Motors Admin",
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✔ Super admin ready: ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PASSWORD}`);
  return authUserId;
}

async function seedSiteSettings() {
  const data: Prisma.InputJsonValue = {
    companyName: "211Motors",
    phone: "+211 92 000 0000",
    whatsappNumber: "211920000000",
    email: "info@211motors.com",
    address: {
      line: "Juba Town, near Muduria Roundabout",
      city: "Juba",
      country: "South Sudan",
      lat: 4.8517,
      lng: 31.5825,
      mapUrl: "https://www.google.com/maps?q=Muduria+Roundabout,Juba,South+Sudan",
    },
    hours: { monFri: "8:00 AM – 6:00 PM", saturday: "8:00 AM – 6:00 PM", sunday: "Closed" },
    socials: {
      facebook: "https://facebook.com/211motors",
      instagram: "https://instagram.com/211motors",
      tiktok: "https://tiktok.com/@211motors",
      x: "https://x.com/211motors",
    },
    // Left empty on purpose: the home page builds its hero banner from
    // featured models' own `heroImageUrl` (live CMS data) whenever any are
    // set, and only falls back to this array otherwise — see the comment in
    // app/[locale]/(public)/page.tsx. There's no admin UI to maintain this
    // field, so seeding it with hardcoded slides just goes stale the moment
    // a model's hero image changes. Populate it manually (e.g. via Prisma
    // Studio) only if curated banner copy independent of any model is ever
    // needed.
    heroSlides: [],
    departments: {
      sales: { label: "Sales", phone: "+211 91 237 7433", email: "sales@211motors.com" },
      service: { label: "Service", phone: "+211 98 555 6999", email: "service@211motors.com" },
      parts: { label: "Parts", phone: "+211 98 555 6999", email: "parts@211motors.com" },
      fleet: { label: "Fleet & Corporate", phone: "+211 91 237 7433", email: "fleet@211motors.com" },
    },
    seoDefaults: {
      title: "211Motors | Soueast & 212 Vehicles — South Sudan & Sudan",
      description:
        "211Motors, in partnership with FBM International Co., is the sole authorized distributor of Soueast and 212 vehicles in South Sudan and Sudan. New vehicles, genuine parts, and factory-backed service in Juba.",
    },
    maintenanceMode: false,
  };

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: { data },
    create: { id: "singleton", data },
  });
  console.log("✔ Site settings seeded (placeholder contact info)");
}

type ModelSeed = Prisma.ModelCreateInput & {
  variants: Prisma.VariantCreateWithoutModelInput[];
  colors: Prisma.ModelColorCreateWithoutModelInput[];
  images: Prisma.ModelImageCreateWithoutModelInput[];
  specGroups: (Prisma.SpecGroupCreateWithoutModelInput & {
    specs: Prisma.SpecItemCreateWithoutGroupInput[];
  })[];
  features: Prisma.FeatureBlockCreateWithoutModelInput[];
};

function standardSpecGroups(opts: {
  engine: string;
  power: string;
  torque: string;
  accel: string;
  topSpeed: string;
  length: string;
  width: string;
  height: string;
  wheelbase: string;
  cargo: string;
  airbags: string;
  warranty: string;
}): ModelSeed["specGroups"] {
  return [
    {
      title: "Engine & Performance",
      sortOrder: 0,
      specs: [
        { label: "Engine", value: opts.engine, sortOrder: 0 },
        { label: "Max power", value: opts.power, sortOrder: 1 },
        { label: "Max torque", value: opts.torque, sortOrder: 2 },
        { label: "0-100 km/h", value: opts.accel, sortOrder: 3 },
        { label: "Top speed", value: opts.topSpeed, unit: "km/h", sortOrder: 4 },
      ],
    },
    {
      title: "Dimensions",
      sortOrder: 1,
      specs: [
        { label: "Length", value: opts.length, unit: "mm", sortOrder: 0 },
        { label: "Width", value: opts.width, unit: "mm", sortOrder: 1 },
        { label: "Height", value: opts.height, unit: "mm", sortOrder: 2 },
        { label: "Wheelbase", value: opts.wheelbase, unit: "mm", sortOrder: 3 },
        { label: "Cargo volume", value: opts.cargo, unit: "L", sortOrder: 4 },
      ],
    },
    {
      title: "Safety",
      sortOrder: 2,
      specs: [
        { label: "Airbags", value: opts.airbags, sortOrder: 0 },
        { label: "ABS + EBD", value: "Standard", sortOrder: 1 },
        { label: "Electronic Stability Control", value: "Standard", sortOrder: 2 },
        { label: "Reverse camera", value: "Standard", sortOrder: 3 },
        { label: "Tyre Pressure Monitoring", value: "Standard", sortOrder: 4 },
      ],
    },
    {
      title: "Comfort & Technology",
      sortOrder: 3,
      specs: [
        { label: "Infotainment display", value: "10.25\" touchscreen", sortOrder: 0 },
        { label: "Instrument cluster", value: "7\" digital", sortOrder: 1 },
        { label: "Climate control", value: "Automatic, dual-zone", sortOrder: 2 },
        { label: "Connectivity", value: "Apple CarPlay / Android Auto", sortOrder: 3 },
      ],
    },
    {
      title: "Warranty",
      sortOrder: 4,
      specs: [
        { label: "Vehicle warranty", value: opts.warranty, sortOrder: 0 },
        { label: "Roadside assistance", value: "3 years", sortOrder: 1 },
        { label: "Genuine parts guarantee", value: "Factory-sourced, always", sortOrder: 2 },
      ],
    },
  ];
}

function buildModels(): ModelSeed[] {
  return [
    {
      slug: "s05",
      name: "S05",
      displayName: "Soueast S05",
      tagline: "Compact urban SUV",
      description:
        "The Soueast S05 is a nimble, efficient compact SUV built for South Sudan and Sudan's streets — easy to park, easy to maintain, and backed by genuine Soueast parts.",
      bodyType: "SUV",
      seats: 5,
      startingPriceUsd: 20500,
      priceOnRequest: false,
      year: 2025,
      status: "PUBLISHED",
      isFeatured: false,
      sortOrder: 0,
      heroImageUrl: placeholderImage("Soueast S05"),
      thumbnailUrl: placeholderImage("S05", "24272c"),
      metaTitle: "Soueast S05 | Compact SUV | 211Motors",
      metaDescription: "Explore the Soueast S05 compact SUV, available now from 211Motors, the sole authorized Soueast distributor in South Sudan and Sudan.",
      variants: [
        {
          name: "Comfort 1.5L 2WD",
          priceUsd: 20500,
          engine: "1.5L Naturally Aspirated",
          powerHp: 112,
          torqueNm: 143,
          fuelType: "PETROL",
          transmission: "CVT",
          drivetrain: "FWD",
          sortOrder: 0,
        },
        {
          name: "Elite 1.5L 2WD",
          priceUsd: 22500,
          engine: "1.5L Naturally Aspirated",
          powerHp: 112,
          torqueNm: 143,
          fuelType: "PETROL",
          transmission: "CVT",
          drivetrain: "FWD",
          sortOrder: 1,
        },
      ],
      colors: [
        { name: "Pearl White", hexCode: "#F5F5F0", sortOrder: 0, imageUrl: placeholderImage("S05 Pearl White", "f5f5f0", "111111") },
        { name: "Graphite Grey", hexCode: "#3B3F45", sortOrder: 1, imageUrl: placeholderImage("S05 Graphite Grey", "3b3f45") },
        { name: "Ruby Red", hexCode: "#8B1E2E", sortOrder: 2, imageUrl: placeholderImage("S05 Ruby Red", "8b1e2e") },
      ],
      images: [
        { url: placeholderImage("S05 Exterior Front"), alt: "Soueast S05 front three-quarter exterior view", category: "exterior", sortOrder: 0 },
        { url: placeholderImage("S05 Exterior Rear"), alt: "Soueast S05 rear exterior view", category: "exterior", sortOrder: 1 },
        { url: placeholderImage("S05 Interior Dashboard"), alt: "Soueast S05 dashboard and infotainment", category: "interior", sortOrder: 2 },
        { url: placeholderImage("S05 Interior Seats"), alt: "Soueast S05 front seats", category: "interior", sortOrder: 3 },
      ],
      specGroups: standardSpecGroups({
        engine: "1.5L Naturally Aspirated, 4-cylinder",
        power: "112 hp @ 6000 rpm",
        torque: "143 Nm @ 4400 rpm",
        accel: "11.2 sec",
        topSpeed: "175",
        length: "4340",
        width: "1810",
        height: "1650",
        wheelbase: "2610",
        cargo: "410",
        airbags: "6",
        warranty: "3 years / 100,000 km",
      }),
      features: [
        { title: "Genuine Parts, Always", description: "Every S05 sold by 211Motors is backed by factory-sourced genuine parts — no grey-market substitutes.", imageUrl: placeholderImage("S05 Feature Parts"), layout: "image-right", sortOrder: 0 },
        { title: "Built for the Region's Roads", description: "Reinforced suspension tuning and generous ground clearance handle South Sudan and Sudan's roads with ease.", imageUrl: placeholderImage("S05 Feature Suspension"), layout: "image-left", sortOrder: 1 },
      ],
    },
    {
      slug: "s06",
      name: "S06",
      displayName: "Soueast S06",
      tagline: "C-segment urban crossover SUV",
      description:
        "The Soueast S06 pairs a punchy 1.6T turbocharged petrol engine with confident, modern styling — a crossover built for both city commuting and weekend trips.",
      bodyType: "CROSSOVER",
      seats: 5,
      startingPriceUsd: 24500,
      priceOnRequest: false,
      year: 2025,
      status: "PUBLISHED",
      isFeatured: true,
      sortOrder: 1,
      heroImageUrl: placeholderImage("Soueast S06"),
      thumbnailUrl: placeholderImage("S06", "24272c"),
      metaTitle: "Soueast S06 | 1.6T Crossover SUV | 211Motors",
      metaDescription: "The Soueast S06 1.6T crossover SUV — available from 211Motors, the sole authorized Soueast distributor in South Sudan and Sudan.",
      variants: [
        {
          name: "Comfort 1.6T 2WD",
          priceUsd: 24500,
          engine: "1.6L Turbo GDI",
          powerHp: 197,
          torqueNm: 290,
          fuelType: "PETROL",
          transmission: "DCT",
          drivetrain: "FWD",
          sortOrder: 0,
        },
        {
          name: "Flagship 1.6T 2WD",
          priceUsd: 27200,
          engine: "1.6L Turbo GDI",
          powerHp: 197,
          torqueNm: 290,
          fuelType: "PETROL",
          transmission: "DCT",
          drivetrain: "FWD",
          sortOrder: 1,
        },
      ],
      colors: [
        { name: "Obsidian Black", hexCode: "#15171A", sortOrder: 0, imageUrl: placeholderImage("S06 Obsidian Black", "15171a") },
        { name: "Pearl White", hexCode: "#F5F5F0", sortOrder: 1, imageUrl: placeholderImage("S06 Pearl White", "f5f5f0", "111111") },
        { name: "Dune Beige", hexCode: "#C7B299", sortOrder: 2, imageUrl: placeholderImage("S06 Dune Beige", "c7b299", "111111") },
      ],
      images: [
        { url: placeholderImage("S06 Exterior Front"), alt: "Soueast S06 front three-quarter exterior view", category: "exterior", sortOrder: 0 },
        { url: placeholderImage("S06 Exterior Side"), alt: "Soueast S06 side profile", category: "exterior", sortOrder: 1 },
        { url: placeholderImage("S06 Interior Dashboard"), alt: "Soueast S06 dashboard and infotainment", category: "interior", sortOrder: 2 },
      ],
      specGroups: standardSpecGroups({
        engine: "1.6L Turbocharged GDI, 4-cylinder",
        power: "197 hp @ 5500 rpm",
        torque: "290 Nm @ 1750-4000 rpm",
        accel: "8.6 sec",
        topSpeed: "195",
        length: "4535",
        width: "1865",
        height: "1680",
        wheelbase: "2670",
        cargo: "483",
        airbags: "6",
        warranty: "3 years / 100,000 km",
      }),
      features: [
        { title: "Turbocharged Confidence", description: "197 hp from the 1.6T engine gives the S06 the power to overtake and climb with ease.", imageUrl: placeholderImage("S06 Feature Engine"), layout: "image-right", sortOrder: 0 },
        { title: "Connected Cabin", description: "A 10.25\" touchscreen with Apple CarPlay and Android Auto keeps you connected on every drive.", imageUrl: placeholderImage("S06 Feature Tech"), layout: "image-left", sortOrder: 1 },
      ],
    },
    {
      slug: "s06-dm",
      name: "S06 DM",
      displayName: "Soueast S06 DM",
      tagline: "Plug-in hybrid crossover SUV",
      description:
        "The Soueast S06 DM combines a 1.5L engine with an electric motor for a plug-in hybrid crossover that dramatically cuts fuel costs without compromising power.",
      bodyType: "CROSSOVER",
      seats: 5,
      startingPriceUsd: 29800,
      priceOnRequest: false,
      year: 2025,
      status: "PUBLISHED",
      isFeatured: true,
      sortOrder: 2,
      heroImageUrl: placeholderImage("Soueast S06 DM"),
      thumbnailUrl: placeholderImage("S06 DM", "24272c"),
      metaTitle: "Soueast S06 DM | Plug-in Hybrid SUV | 211Motors",
      metaDescription: "The Soueast S06 DM plug-in hybrid crossover — available from 211Motors, the sole authorized Soueast distributor in South Sudan and Sudan.",
      variants: [
        {
          name: "DM Flagship",
          priceUsd: 29800,
          engine: "1.5L Hybrid + Electric Motor",
          powerHp: 245,
          torqueNm: 480,
          fuelType: "PLUGIN_HYBRID",
          transmission: "DCT",
          drivetrain: "FWD",
          sortOrder: 0,
        },
      ],
      colors: [
        { name: "Obsidian Black", hexCode: "#15171A", sortOrder: 0, imageUrl: placeholderImage("S06 DM Black", "15171a") },
        { name: "Glacier Blue", hexCode: "#3E5C76", sortOrder: 1, imageUrl: placeholderImage("S06 DM Blue", "3e5c76") },
      ],
      images: [
        { url: placeholderImage("S06 DM Exterior Front"), alt: "Soueast S06 DM front three-quarter exterior view", category: "exterior", sortOrder: 0 },
        { url: placeholderImage("S06 DM Interior"), alt: "Soueast S06 DM interior", category: "interior", sortOrder: 1 },
      ],
      specGroups: standardSpecGroups({
        engine: "1.5L Hybrid + Electric Motor (PHEV)",
        power: "245 hp combined",
        torque: "480 Nm combined",
        accel: "6.9 sec",
        topSpeed: "185",
        length: "4535",
        width: "1865",
        height: "1685",
        wheelbase: "2670",
        cargo: "420",
        airbags: "6",
        warranty: "3 years / 100,000 km (8 years / 150,000 km battery)",
      }),
      features: [
        { title: "Plug In, Save More", description: "A full electric-only range covers most daily commutes before the engine ever needs to run.", imageUrl: placeholderImage("S06 DM Feature Charging"), layout: "image-right", sortOrder: 0 },
        { title: "480 Nm, Instantly", description: "Electric torque delivers instant response for effortless overtaking.", imageUrl: placeholderImage("S06 DM Feature Torque"), layout: "image-left", sortOrder: 1 },
      ],
    },
    {
      slug: "s07",
      name: "S07",
      displayName: "Soueast S07",
      tagline: "C-segment family SUV",
      description:
        "The Soueast S07 is a family-focused SUV with dual 12.3\" connected screens and a full ADAS suite — comfort, safety, and technology in one package.",
      bodyType: "SUV",
      seats: 5,
      startingPriceUsd: 27900,
      priceOnRequest: false,
      year: 2025,
      status: "PUBLISHED",
      isFeatured: true,
      sortOrder: 3,
      heroImageUrl: placeholderImage("Soueast S07"),
      thumbnailUrl: placeholderImage("S07", "24272c"),
      metaTitle: "Soueast S07 | Family SUV with ADAS | 211Motors",
      metaDescription: "The Soueast S07 family SUV with 12.3\" connected screens and ADAS — from 211Motors, sole authorized Soueast distributor in South Sudan and Sudan.",
      variants: [
        {
          name: "Comfort 1.5T 2WD",
          priceUsd: 27900,
          engine: "1.5L Turbo GDI",
          powerHp: 184,
          torqueNm: 275,
          fuelType: "PETROL",
          transmission: "CVT",
          drivetrain: "FWD",
          sortOrder: 0,
        },
        {
          name: "Flagship 1.5T 2WD",
          priceUsd: 30900,
          engine: "1.5L Turbo GDI",
          powerHp: 184,
          torqueNm: 275,
          fuelType: "PETROL",
          transmission: "CVT",
          drivetrain: "FWD",
          sortOrder: 1,
        },
      ],
      colors: [
        { name: "Pearl White", hexCode: "#F5F5F0", sortOrder: 0, imageUrl: placeholderImage("S07 Pearl White", "f5f5f0", "111111") },
        { name: "Obsidian Black", hexCode: "#15171A", sortOrder: 1, imageUrl: placeholderImage("S07 Obsidian Black", "15171a") },
        { name: "Ruby Red", hexCode: "#8B1E2E", sortOrder: 2, imageUrl: placeholderImage("S07 Ruby Red", "8b1e2e") },
        { name: "Graphite Grey", hexCode: "#3B3F45", sortOrder: 3, imageUrl: placeholderImage("S07 Graphite Grey", "3b3f45") },
      ],
      images: [
        { url: placeholderImage("S07 Exterior Front"), alt: "Soueast S07 front three-quarter exterior view", category: "exterior", sortOrder: 0 },
        { url: placeholderImage("S07 Exterior Rear"), alt: "Soueast S07 rear exterior view", category: "exterior", sortOrder: 1 },
        { url: placeholderImage("S07 Interior Dual Screens"), alt: "Soueast S07 dual 12.3-inch connected screens", category: "interior", sortOrder: 2 },
        { url: placeholderImage("S07 Interior Rear Seats"), alt: "Soueast S07 rear seat legroom", category: "interior", sortOrder: 3 },
      ],
      specGroups: standardSpecGroups({
        engine: "1.5L Turbocharged GDI, 4-cylinder",
        power: "184 hp @ 5500 rpm",
        torque: "275 Nm @ 1750-4000 rpm",
        accel: "9.2 sec",
        topSpeed: "190",
        length: "4600",
        width: "1900",
        height: "1690",
        wheelbase: "2720",
        cargo: "520",
        airbags: "8",
        warranty: "3 years / 100,000 km",
      }),
      features: [
        { title: "Dual 12.3\" Connected Screens", description: "A fully digital cockpit puts navigation, media, and vehicle data at your fingertips.", imageUrl: placeholderImage("S07 Feature Screens"), layout: "image-right", sortOrder: 0 },
        { title: "Full ADAS Suite", description: "Adaptive cruise control, lane-keep assist, and automatic emergency braking come standard for total peace of mind.", imageUrl: placeholderImage("S07 Feature ADAS"), layout: "image-left", sortOrder: 1 },
        { title: "Room for the Whole Family", description: "Class-leading rear legroom and a 520L boot handle school runs and road trips alike.", imageUrl: placeholderImage("S07 Feature Space"), layout: "image-right", sortOrder: 2 },
      ],
    },
    {
      slug: "s09",
      name: "S09",
      displayName: "Soueast S09",
      tagline: "Flagship 7-seat SUV",
      description:
        "The Soueast S09 is the flagship of the range — a D-segment 7-seat SUV with a 2.0T engine, built for large families, NGOs, and corporate fleets that need space and power.",
      bodyType: "SUV",
      seats: 7,
      startingPriceUsd: 36500,
      priceOnRequest: false,
      year: 2025,
      status: "PUBLISHED",
      isFeatured: true,
      sortOrder: 4,
      heroImageUrl: placeholderImage("Soueast S09"),
      thumbnailUrl: placeholderImage("S09", "24272c"),
      metaTitle: "Soueast S09 | Flagship 7-Seat SUV | 211Motors",
      metaDescription: "The Soueast S09 flagship 7-seat SUV with a 2.0T engine — available from 211Motors, the sole authorized Soueast distributor in South Sudan and Sudan.",
      variants: [
        {
          name: "Comfort 2.0T 2WD",
          priceUsd: 36500,
          engine: "2.0L Turbo GDI",
          powerHp: 249,
          torqueNm: 385,
          fuelType: "PETROL",
          transmission: "AUTOMATIC",
          drivetrain: "FWD",
          sortOrder: 0,
        },
        {
          name: "Flagship 2.0T AWD",
          priceUsd: 41500,
          engine: "2.0L Turbo GDI",
          powerHp: 249,
          torqueNm: 385,
          fuelType: "PETROL",
          transmission: "AUTOMATIC",
          drivetrain: "AWD",
          sortOrder: 1,
        },
      ],
      colors: [
        { name: "Obsidian Black", hexCode: "#15171A", sortOrder: 0, imageUrl: placeholderImage("S09 Obsidian Black", "15171a") },
        { name: "Pearl White", hexCode: "#F5F5F0", sortOrder: 1, imageUrl: placeholderImage("S09 Pearl White", "f5f5f0", "111111") },
        { name: "Graphite Grey", hexCode: "#3B3F45", sortOrder: 2, imageUrl: placeholderImage("S09 Graphite Grey", "3b3f45") },
      ],
      images: [
        { url: placeholderImage("S09 Exterior Front"), alt: "Soueast S09 front three-quarter exterior view", category: "exterior", sortOrder: 0 },
        { url: placeholderImage("S09 Exterior Rear"), alt: "Soueast S09 rear exterior view", category: "exterior", sortOrder: 1 },
        { url: placeholderImage("S09 Interior Third Row"), alt: "Soueast S09 third row seating", category: "interior", sortOrder: 2 },
        { url: placeholderImage("S09 Interior Dashboard"), alt: "Soueast S09 dashboard", category: "interior", sortOrder: 3 },
      ],
      specGroups: standardSpecGroups({
        engine: "2.0L Turbocharged GDI, 4-cylinder",
        power: "249 hp @ 5500 rpm",
        torque: "385 Nm @ 2000-4000 rpm",
        accel: "8.1 sec",
        topSpeed: "200",
        length: "4845",
        width: "1930",
        height: "1780",
        wheelbase: "2820",
        cargo: "685",
        airbags: "8",
        warranty: "3 years / 100,000 km",
      }),
      features: [
        { title: "Seats Seven, Comfortably", description: "Three full rows of seating make the S09 the natural choice for large families and fleet operators.", imageUrl: placeholderImage("S09 Feature Seating"), layout: "image-right", sortOrder: 0 },
        { title: "AWD Capability", description: "The Flagship AWD variant adds confident all-weather, all-terrain traction.", imageUrl: placeholderImage("S09 Feature AWD"), layout: "image-left", sortOrder: 1 },
        { title: "Built for Fleets", description: "NGOs, government agencies, and corporates rely on the S09 for durability and after-sales support across South Sudan and Sudan.", imageUrl: placeholderImage("S09 Feature Fleet"), layout: "image-right", sortOrder: 2 },
      ],
    },
    {
      slug: "212-t01",
      name: "T01",
      displayName: "212 T01",
      tagline: "Retro-styled off-road SUV",
      description:
        "The 212 T01 revives classic off-road styling with modern engineering — a rugged, boxy SUV with low-range 4WD, built for South Sudan and Sudan's toughest roads and backed by genuine parts and factory warranty.",
      bodyType: "SUV",
      seats: 5,
      startingPriceUsd: 31000,
      priceOnRequest: false,
      year: 2025,
      status: "PUBLISHED",
      isFeatured: true,
      sortOrder: 5,
      heroImageUrl: placeholderImage("212 T01"),
      thumbnailUrl: placeholderImage("212 T01", "24272c"),
      metaTitle: "212 T01 | Off-Road SUV | 211Motors",
      metaDescription: "The 212 T01 retro-styled off-road SUV — available from 211Motors, the sole authorized 212 distributor in South Sudan and Sudan.",
      variants: [
        {
          name: "Explorer 2.0T 4WD",
          priceUsd: 31000,
          engine: "2.0L Turbo GDI",
          powerHp: 224,
          torqueNm: 380,
          fuelType: "PETROL",
          transmission: "AUTOMATIC",
          drivetrain: "FOUR_WD",
          sortOrder: 0,
        },
        {
          name: "Adventure 2.0T 4WD",
          priceUsd: 34500,
          engine: "2.0L Turbo GDI",
          powerHp: 224,
          torqueNm: 380,
          fuelType: "PETROL",
          transmission: "AUTOMATIC",
          drivetrain: "FOUR_WD",
          sortOrder: 1,
        },
      ],
      colors: [
        { name: "Military Green", hexCode: "#4B5320", sortOrder: 0, imageUrl: placeholderImage("212 T01 Military Green", "4b5320") },
        { name: "Sand Beige", hexCode: "#C2B280", sortOrder: 1, imageUrl: placeholderImage("212 T01 Sand Beige", "c2b280", "111111") },
        { name: "Obsidian Black", hexCode: "#15171A", sortOrder: 2, imageUrl: placeholderImage("212 T01 Obsidian Black", "15171a") },
      ],
      images: [
        { url: placeholderImage("212 T01 Exterior Front"), alt: "212 T01 front three-quarter exterior view", category: "exterior", sortOrder: 0 },
        { url: placeholderImage("212 T01 Exterior Rear"), alt: "212 T01 rear exterior view", category: "exterior", sortOrder: 1 },
        { url: placeholderImage("212 T01 Interior Dashboard"), alt: "212 T01 dashboard and infotainment", category: "interior", sortOrder: 2 },
      ],
      specGroups: standardSpecGroups({
        engine: "2.0L Turbocharged GDI, 4-cylinder",
        power: "224 hp @ 5200 rpm",
        torque: "380 Nm @ 1800-4000 rpm",
        accel: "9.8 sec",
        topSpeed: "170",
        length: "4380",
        width: "1900",
        height: "1900",
        wheelbase: "2650",
        cargo: "506",
        airbags: "6",
        warranty: "3 years / 100,000 km",
      }),
      features: [
        { title: "Built for Off-Road", description: "Low-range 4WD and a locking rear differential give the T01 serious capability off the tarmac.", imageUrl: placeholderImage("212 T01 Feature 4WD"), layout: "image-right", sortOrder: 0 },
        { title: "Retro Styling, Modern Tech", description: "Classic boxy proportions outside, a 10.25\" touchscreen and full driver-assist suite inside.", imageUrl: placeholderImage("212 T01 Feature Tech"), layout: "image-left", sortOrder: 1 },
      ],
    },
    {
      slug: "212-t02",
      name: "T02",
      displayName: "212 T02",
      tagline: "Flagship off-road SUV",
      description:
        "The 212 T02 is the flagship of the 212 range — a ladder-frame off-road SUV with serious capability for fleet, NGO, and expedition use across South Sudan and Sudan.",
      bodyType: "SUV",
      seats: 5,
      startingPriceUsd: 39500,
      priceOnRequest: false,
      year: 2025,
      status: "PUBLISHED",
      isFeatured: true,
      sortOrder: 6,
      heroImageUrl: placeholderImage("212 T02"),
      thumbnailUrl: placeholderImage("212 T02", "24272c"),
      metaTitle: "212 T02 | Flagship Off-Road SUV | 211Motors",
      metaDescription: "The 212 T02 flagship ladder-frame off-road SUV — available from 211Motors, the sole authorized 212 distributor in South Sudan and Sudan.",
      variants: [
        {
          name: "Field 2.0T 4WD",
          priceUsd: 39500,
          engine: "2.0L Turbo GDI",
          powerHp: 238,
          torqueNm: 400,
          fuelType: "PETROL",
          transmission: "AUTOMATIC",
          drivetrain: "FOUR_WD",
          sortOrder: 0,
        },
        {
          name: "Expedition 2.0T 4WD",
          priceUsd: 44000,
          engine: "2.0L Turbo GDI",
          powerHp: 238,
          torqueNm: 400,
          fuelType: "PETROL",
          transmission: "AUTOMATIC",
          drivetrain: "FOUR_WD",
          sortOrder: 1,
        },
      ],
      colors: [
        { name: "Obsidian Black", hexCode: "#15171A", sortOrder: 0, imageUrl: placeholderImage("212 T02 Obsidian Black", "15171a") },
        { name: "Sand Beige", hexCode: "#C2B280", sortOrder: 1, imageUrl: placeholderImage("212 T02 Sand Beige", "c2b280", "111111") },
        { name: "Convoy Grey", hexCode: "#5B6167", sortOrder: 2, imageUrl: placeholderImage("212 T02 Convoy Grey", "5b6167") },
      ],
      images: [
        { url: placeholderImage("212 T02 Exterior Front"), alt: "212 T02 front three-quarter exterior view", category: "exterior", sortOrder: 0 },
        { url: placeholderImage("212 T02 Exterior Rear"), alt: "212 T02 rear exterior view", category: "exterior", sortOrder: 1 },
        { url: placeholderImage("212 T02 Interior Dashboard"), alt: "212 T02 dashboard", category: "interior", sortOrder: 2 },
      ],
      specGroups: standardSpecGroups({
        engine: "2.0L Turbocharged GDI, 4-cylinder",
        power: "238 hp @ 5200 rpm",
        torque: "400 Nm @ 1900-4200 rpm",
        accel: "9.1 sec",
        topSpeed: "175",
        length: "4750",
        width: "1920",
        height: "1930",
        wheelbase: "2800",
        cargo: "590",
        airbags: "6",
        warranty: "3 years / 100,000 km",
      }),
      features: [
        { title: "Ladder-Frame Toughness", description: "A body-on-frame chassis built to handle unpaved roads, river crossings, and heavy loads.", imageUrl: placeholderImage("212 T02 Feature Chassis"), layout: "image-right", sortOrder: 0 },
        { title: "Built for Fleets Across Two Countries", description: "NGOs and government fleets rely on the T02 for durability and after-sales support across South Sudan and Sudan.", imageUrl: placeholderImage("212 T02 Feature Fleet"), layout: "image-left", sortOrder: 1 },
      ],
    },
  ];
}

async function seedModels() {
  const modelIds: Record<string, { id: string; variantIds: string[] }> = {};

  for (const m of buildModels()) {
    const { specGroups, ...rest } = m;
    const model = await prisma.model.upsert({
      where: { slug: m.slug },
      update: {},
      create: {
        ...rest,
        variants: { create: m.variants },
        colors: { create: m.colors },
        images: { create: m.images },
        features: { create: m.features },
      },
      include: { variants: true },
    });

    // Spec groups/items need the model to exist first (nested create above already
    // handles variants/colors/images/features in one go, but SpecGroup->SpecItem is
    // two levels deep so it's created separately per group for readability).
    for (const group of specGroups) {
      const existingGroup = await prisma.specGroup.findFirst({
        where: { modelId: model.id, title: group.title },
      });
      if (!existingGroup) {
        await prisma.specGroup.create({
          data: {
            modelId: model.id,
            title: group.title,
            sortOrder: group.sortOrder as number,
            specs: { create: group.specs },
          },
        });
      }
    }

    modelIds[m.slug] = { id: model.id, variantIds: model.variants.map((v) => v.id) };
  }

  console.log(`✔ Seeded ${Object.keys(modelIds).length} models (5 Soueast + 2 212)`);
  return modelIds;
}

async function seedInventory(modelIds: Record<string, { id: string; variantIds: string[] }>) {
  const units: Prisma.InventoryUnitCreateInput[] = [
    {
      stockNumber: "211M-S05-0001",
      vin: "LSVAX0R47NA000001",
      model: { connect: { id: modelIds.s05.id } },
      variant: { connect: { id: modelIds.s05.variantIds[0] } },
      year: 2025,
      colorName: "Pearl White",
      condition: "NEW",
      status: "AVAILABLE",
      priceUsd: 20500,
      arrivalDate: new Date("2026-06-01"),
    },
    {
      stockNumber: "211M-S05-0002",
      vin: "LSVAX0R47NA000002",
      model: { connect: { id: modelIds.s05.id } },
      variant: { connect: { id: modelIds.s05.variantIds[1] } },
      year: 2025,
      colorName: "Ruby Red",
      condition: "NEW",
      status: "AVAILABLE",
      priceUsd: 22500,
      arrivalDate: new Date("2026-06-15"),
    },
    {
      stockNumber: "211M-S06-0001",
      vin: "LSVAX0R47NA000101",
      model: { connect: { id: modelIds.s06.id } },
      variant: { connect: { id: modelIds.s06.variantIds[0] } },
      year: 2025,
      colorName: "Obsidian Black",
      condition: "NEW",
      status: "AVAILABLE",
      priceUsd: 24500,
      arrivalDate: new Date("2026-06-10"),
    },
    {
      stockNumber: "211M-S06-0002",
      vin: "LSVAX0R47NA000102",
      model: { connect: { id: modelIds.s06.id } },
      variant: { connect: { id: modelIds.s06.variantIds[1] } },
      year: 2025,
      colorName: "Dune Beige",
      condition: "NEW",
      status: "RESERVED",
      priceUsd: 27200,
      arrivalDate: new Date("2026-07-01"),
    },
    {
      stockNumber: "211M-S06DM-0001",
      vin: "LSVAX0R47NA000201",
      model: { connect: { id: modelIds["s06-dm"].id } },
      variant: { connect: { id: modelIds["s06-dm"].variantIds[0] } },
      year: 2025,
      colorName: "Glacier Blue",
      condition: "NEW",
      status: "IN_TRANSIT",
      priceUsd: 29800,
      arrivalDate: new Date("2026-09-01"),
    },
    {
      stockNumber: "211M-S07-0001",
      vin: "LSVAX0R47NA000301",
      model: { connect: { id: modelIds.s07.id } },
      variant: { connect: { id: modelIds.s07.variantIds[0] } },
      year: 2025,
      colorName: "Pearl White",
      condition: "NEW",
      status: "AVAILABLE",
      priceUsd: 27900,
      arrivalDate: new Date("2026-05-20"),
    },
    {
      stockNumber: "211M-S07-0002",
      vin: "LSVAX0R47NA000302",
      model: { connect: { id: modelIds.s07.id } },
      variant: { connect: { id: modelIds.s07.variantIds[1] } },
      year: 2025,
      colorName: "Ruby Red",
      condition: "NEW",
      status: "SOLD",
      priceUsd: 30900,
      arrivalDate: new Date("2026-04-05"),
      soldAt: new Date("2026-05-02"),
    },
    {
      stockNumber: "211M-S09-0001",
      vin: "LSVAX0R47NA000401",
      model: { connect: { id: modelIds.s09.id } },
      variant: { connect: { id: modelIds.s09.variantIds[0] } },
      year: 2025,
      colorName: "Obsidian Black",
      condition: "NEW",
      status: "AVAILABLE",
      priceUsd: 36500,
      arrivalDate: new Date("2026-06-25"),
    },
    {
      stockNumber: "211M-S09-0002",
      vin: "LSVAX0R47NA000402",
      model: { connect: { id: modelIds.s09.id } },
      variant: { connect: { id: modelIds.s09.variantIds[1] } },
      year: 2025,
      colorName: "Graphite Grey",
      condition: "NEW",
      status: "IN_TRANSIT",
      priceUsd: 41500,
      arrivalDate: new Date("2026-10-01"),
    },
    {
      stockNumber: "211M-212T1-0001",
      vin: "LSVAX0R47NA000501",
      model: { connect: { id: modelIds["212-t01"].id } },
      variant: { connect: { id: modelIds["212-t01"].variantIds[0] } },
      year: 2025,
      colorName: "Military Green",
      condition: "NEW",
      status: "AVAILABLE",
      priceUsd: 31000,
      arrivalDate: new Date("2026-06-20"),
    },
    {
      stockNumber: "211M-212T2-0001",
      vin: "LSVAX0R47NA000601",
      model: { connect: { id: modelIds["212-t02"].id } },
      variant: { connect: { id: modelIds["212-t02"].variantIds[1] } },
      year: 2025,
      colorName: "Convoy Grey",
      condition: "NEW",
      status: "IN_TRANSIT",
      priceUsd: 44000,
      arrivalDate: new Date("2026-11-01"),
    },
  ];

  for (const unit of units) {
    await prisma.inventoryUnit.upsert({
      where: { stockNumber: unit.stockNumber as string },
      update: {},
      create: {
        ...unit,
        images: {
          create: [
            { url: placeholderImage(`${unit.stockNumber} Front`), alt: "Vehicle exterior front", sortOrder: 0 },
            { url: placeholderImage(`${unit.stockNumber} Side`), alt: "Vehicle exterior side", sortOrder: 1 },
          ],
        },
      },
    });
  }
  console.log(`✔ Seeded ${units.length} inventory units`);
}

async function seedArticles(authorId: string) {
  for (const a of newsArticles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: { ...a, authorId },
    });
  }
  console.log(`✔ Seeded ${newsArticles.length} news articles`);
}

async function seedTestimonials() {
  const testimonials = [
    {
      authorName: "Achol Deng",
      authorTitle: "Operations Director",
      company: "South Sudan Relief Network (NGO)",
      quote: "211Motors' fleet support has been outstanding. Genuine parts and fast turnaround keep our vehicles on the road when it matters most.",
      rating: 5,
      isApproved: true,
      sortOrder: 0,
    },
    {
      authorName: "James Lual",
      authorTitle: "Procurement Officer",
      company: "Ministry of Roads and Bridges",
      quote: "We ordered a fleet of Soueast S09s for our regional offices. The corporate purchase process was smooth and after-sales support has been reliable.",
      rating: 5,
      isApproved: true,
      sortOrder: 1,
    },
    {
      authorName: "Nyandeng Mabior",
      authorTitle: "Private buyer",
      company: null,
      quote: "My S07 has been reliable and comfortable on the school run. The team at 211Motors made the whole buying process easy.",
      rating: 5,
      isApproved: true,
      sortOrder: 2,
    },
    {
      authorName: "Peter Garang",
      authorTitle: "Field Operations Manager",
      company: "Nile Logistics Ltd",
      quote: "Our 212 T02s handle the unpaved routes between Juba and our upcountry sites without complaint. 211Motors' fleet team has been a genuine partner.",
      rating: 4,
      isApproved: true,
      sortOrder: 3,
    },
  ];

  for (const t of testimonials) {
    const exists = await prisma.testimonial.findFirst({ where: { authorName: t.authorName, quote: t.quote } });
    if (!exists) {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log(`✔ Seeded ${testimonials.length} testimonials`);
}

async function main() {
  const superAdminId = await seedSuperAdmin();
  await seedSiteSettings();
  const modelIds = await seedModels();
  await seedInventory(modelIds);
  await seedArticles(superAdminId!);
  await seedTestimonials();
  console.log("\n✔ Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
