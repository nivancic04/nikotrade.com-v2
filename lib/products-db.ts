export type ProductCategory = "Automirisi" | "Sportska oprema" | "Case";

export type ProductRecord = {
  id: number;
  slug: string;
  name: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  scent: string;
  material: string;
  duration: string;
  priceEur: number;
  stock: number;
  featured: boolean;
};

// Testna "tablica" proizvoda. Kasnije se moze zamijeniti SQL/Prisma bazom.
export const PRODUCTS_TABLE: ProductRecord[] = [
  {
    id: 1,
    slug: "dinamo-plavi-automiris",
    name: "Dinamo Plavi Automiris",
    category: "Automirisi",
    shortDescription: "Personalizirani dres automiris u plavoj varijanti.",
    description:
      "Premium automiris u obliku dresa kluba, sa postojanim mirisom i jacom zasicenoscu boje za dugotrajan vizualni dojam.",
    scent: "Ocean Breeze",
    material: "Cellulose fiber + premium tinta",
    duration: "30-45 dana",
    priceEur: 8.9,
    stock: 32,
    featured: true,
  },
  {
    id: 2,
    slug: "slaven-belupo-automiris",
    name: "Slaven Belupo Automiris",
    category: "Automirisi",
    shortDescription: "Klupski automiris sa prepoznatljivim detaljima.",
    description:
      "Automiris dizajniran za navijace koji zele klupski identitet u automobilu. Vizual i miris ostaju stabilni kroz duzi period.",
    scent: "Fresh Citrus",
    material: "Cellulose fiber + matte print",
    duration: "25-40 dana",
    priceEur: 8.5,
    stock: 21,
    featured: true,
  },
  {
    id: 3,
    slug: "personalizirani-dres-automiris",
    name: "Personalizirani Dres Automiris",
    category: "Automirisi",
    shortDescription: "Model sa custom imenom i brojem.",
    description:
      "Potpuno personaliziran model automirisa: birate boje, ime i broj. Idealan kao poklon ili promo artikl za timove.",
    scent: "Black Ice",
    material: "Cellulose fiber + UV print",
    duration: "30-50 dana",
    priceEur: 9.9,
    stock: 17,
    featured: true,
  },
  {
    id: 4,
    slug: "sport-majica-performance",
    name: "Sport Majica Performance",
    category: "Sportska oprema",
    shortDescription: "Lagana i prozracna majica za trening.",
    description:
      "Majica od brzosuseceg materijala sa ergonomskim krojem. Namijenjena za intenzivne treninge i svakodnevno nosenje.",
    scent: "N/A",
    material: "Polyester blend",
    duration: "N/A",
    priceEur: 24.9,
    stock: 58,
    featured: false,
  },
  {
    id: 5,
    slug: "sportski-ruksak-team",
    name: "Sportski Ruksak Team",
    category: "Sportska oprema",
    shortDescription: "Ruksak s vise pretinaca i jacim dnom.",
    description:
      "Praktican ruksak za trening i putovanja. Ojacao podlogu, bocne dzepove i prostor za osnovnu opremu.",
    scent: "N/A",
    material: "Water-resistant textile",
    duration: "N/A",
    priceEur: 34.9,
    stock: 14,
    featured: false,
  },
  {
    id: 6,
    slug: "fitness-boca-pro",
    name: "Fitness Boca Pro",
    category: "Sportska oprema",
    shortDescription: "Izolirana boca za trening i teretanu.",
    description:
      "Kompaktna i cvrsta boca sa sigurnim zatvaranjem i minimalistickim izgledom. Lako odrzavanje i dugotrajna upotreba.",
    scent: "N/A",
    material: "Stainless steel",
    duration: "N/A",
    priceEur: 19.9,
    stock: 40,
    featured: false,
  },
  {
    id: 7,
    slug: "gravirana-casa-classic",
    name: "Gravirana Casa Classic",
    category: "Case",
    shortDescription: "Staklena casa sa personaliziranom gravurom.",
    description:
      "Elegantna casa sa preciznom gravurom po zelji. Pogodna za poklone, evente i posebne prigode.",
    scent: "N/A",
    material: "Premium glass",
    duration: "N/A",
    priceEur: 14.9,
    stock: 27,
    featured: false,
  },
  {
    id: 8,
    slug: "gravirana-casa-deluxe",
    name: "Gravirana Casa Deluxe",
    category: "Case",
    shortDescription: "Deblje staklo i detaljna personalizacija.",
    description:
      "Model vise klase sa jacim staklom i finijom obradom gravure. Namijenjen za premium poklone i setove.",
    scent: "N/A",
    material: "Thick-cut crystal glass",
    duration: "N/A",
    priceEur: 19.5,
    stock: 11,
    featured: false,
  },
  {
    id: 9,
    slug: "gravirani-set-case-2x",
    name: "Gravirani Set Casa 2x",
    category: "Case",
    shortDescription: "Set od dvije case sa custom natpisom.",
    description:
      "Par case sa uskladjenom gravurom, idealan za poklon set. Moguce kombinirati logo, ime i datum.",
    scent: "N/A",
    material: "Premium glass set",
    duration: "N/A",
    priceEur: 29.9,
    stock: 9,
    featured: false,
  },
];

export function getAllProducts() {
  return PRODUCTS_TABLE;
}

export function getProductBySlug(slug: string) {
  return PRODUCTS_TABLE.find((product) => product.slug === slug);
}
