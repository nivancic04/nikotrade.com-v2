type AirFreshenerClubRow = {
  id: number;
  slug: string;
  name: string;
  shortLabel: string;
  logoImageUrl: string;
  websiteUrl: string;
  logoScale: string | number;
  sortOrder: number;
};

type AirFreshenerClubLegacyRow = {
  id: number;
  slug: string;
  name: string;
  shortLabel: string;
  logoImageUrl: string;
  websiteUrl: string;
  sortOrder: number;
};

type AirFreshenerShowcaseRow = {
  id: number;
  clubId: number;
  images: unknown;
  sortOrder: number;
};

export type AirFreshenerShowcaseImage = {
  imageUrl: string;
};

export type AirFreshenerClub = {
  id: number;
  slug: string;
  name: string;
  shortLabel: string;
  logoImageUrl: string;
  websiteUrl: string;
  logoScale: number;
  sortOrder: number;
};

export type AirFreshenerShowcase = {
  id: number;
  clubId: number;
  sortOrder: number;
  images: AirFreshenerShowcaseImage[];
  club: AirFreshenerClub;
};

export type AirFreshenerPageData = {
  clubs: AirFreshenerClub[];
  showcases: AirFreshenerShowcase[];
};

const FALLBACK_CLUBS: AirFreshenerClub[] = [
  {
    id: 1,
    slug: "gnk-dinamo-zagreb",
    name: "GNK Dinamo Zagreb",
    shortLabel: "Dinamo",
    logoImageUrl: "/img/automirisi/klubovi/logotipi/dinamo.png",
    websiteUrl: "https://shop.gnkdinamo.hr/hr/p/710/miris-za-auto-fresh",
    logoScale: 1,
    sortOrder: 1,
  },
  {
    id: 2,
    slug: "nk-slaven-belupo",
    name: "NK Slaven Belupo",
    shortLabel: "Slaven Belupo",
    logoImageUrl: "/img/automirisi/klubovi/logotipi/slaven-belupo.png",
    websiteUrl:
      "https://webshop.nk-slaven-belupo.hr/navijacki-rekviziti/slaven-belupo-automiris-detail",
    logoScale: 1.16,
    sortOrder: 2,
  },
];

const FALLBACK_SHOWCASES: Omit<AirFreshenerShowcase, "club">[] = [
  {
    id: 1,
    clubId: 1,
    sortOrder: 1,
    images: [
      { imageUrl: "/img/automirisi/izlozba/dinamo-stadion.png" },
      { imageUrl: "/img/automirisi/izlozba/dinamo-auto.png" },
      { imageUrl: "/img/automirisi/izlozba/dinamo-kartoncic.png" },
    ],
  },
  {
    id: 2,
    clubId: 2,
    sortOrder: 2,
    images: [
      { imageUrl: "/img/automirisi/izlozba/slaven-stadion.png" },
      { imageUrl: "/img/automirisi/izlozba/slaven-auto.png" },
      { imageUrl: "/img/automirisi/izlozba/slaven-kartoncic.png" },
    ],
  },
];

function fallbackData(): AirFreshenerPageData {
  const clubs = [...FALLBACK_CLUBS].sort((a, b) => a.sortOrder - b.sortOrder);
  const clubsById = new Map(clubs.map((club) => [club.id, club]));

  const showcases = [...FALLBACK_SHOWCASES]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((showcase) => {
      const club = clubsById.get(showcase.clubId);
      if (!club) return null;

      return {
        ...showcase,
        club,
      };
    })
    .filter((showcase): showcase is AirFreshenerShowcase => showcase !== null);

  return { clubs, showcases };
}

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeImages(imagesValue: unknown): AirFreshenerShowcaseImage[] {
  if (!Array.isArray(imagesValue)) return [];

  const normalized = imagesValue
    .map((item) => {
      if (hasString(item)) {
        return { imageUrl: item.trim() };
      }

      if (!item || typeof item !== "object") return null;

      const candidate = item as {
        imageUrl?: unknown;
      };

      if (!hasString(candidate.imageUrl)) {
        return null;
      }

      return {
        imageUrl: candidate.imageUrl.trim(),
      };
    })
    .filter((item): item is AirFreshenerShowcaseImage => item !== null);

  return normalized;
}

async function getSqlClient() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  const { sql } = await import("@/lib/db");
  return sql;
}

function isMissingColumnError(error: unknown, columnName: string) {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { code?: string; message?: string };
  if (maybe.code !== "42703") return false;
  if (typeof maybe.message !== "string") return false;
  return maybe.message.includes(`"${columnName}"`);
}

async function readAirFreshenerPageDataFromDb(): Promise<AirFreshenerPageData | null> {
  const sql = await getSqlClient();
  if (!sql) return null;

  let clubs: AirFreshenerClub[];
  try {
    const clubsFromDb = await sql<AirFreshenerClubRow[]>`
      select
        id,
        slug,
        name,
        short_label as "shortLabel",
        logo_image_url as "logoImageUrl",
        website_url as "websiteUrl",
        logo_scale as "logoScale",
        sort_order as "sortOrder"
      from air_freshener_clubs
      where active = true
      order by sort_order asc, id asc
    `;

    clubs = clubsFromDb.map((club) => ({
      id: club.id,
      slug: club.slug,
      name: club.name,
      shortLabel: club.shortLabel,
      logoImageUrl: club.logoImageUrl,
      websiteUrl: club.websiteUrl,
      logoScale: Number(club.logoScale || 1),
      sortOrder: club.sortOrder,
    }));
  } catch (error) {
    if (!isMissingColumnError(error, "logo_scale")) {
      throw error;
    }

    const legacyClubs = await sql<AirFreshenerClubLegacyRow[]>`
      select
        id,
        slug,
        name,
        short_label as "shortLabel",
        logo_image_url as "logoImageUrl",
        website_url as "websiteUrl",
        sort_order as "sortOrder"
      from air_freshener_clubs
      where active = true
      order by sort_order asc, id asc
    `;

    clubs = legacyClubs.map((club) => ({
      id: club.id,
      slug: club.slug,
      name: club.name,
      shortLabel: club.shortLabel,
      logoImageUrl: club.logoImageUrl,
      websiteUrl: club.websiteUrl,
      logoScale: 1,
      sortOrder: club.sortOrder,
    }));
  }

  const showcasesFromDb = await sql<AirFreshenerShowcaseRow[]>`
    select
      id,
      club_id as "clubId",
      images,
      sort_order as "sortOrder"
    from air_freshener_featured_products
    where active = true
    order by sort_order asc, id asc
  `;

  const clubsById = new Map(clubs.map((club) => [club.id, club]));

  const showcases = showcasesFromDb
    .map((showcase) => {
      const club = clubsById.get(showcase.clubId);
      if (!club) return null;

      return {
        id: showcase.id,
        clubId: showcase.clubId,
        sortOrder: showcase.sortOrder,
        images: normalizeImages(showcase.images),
        club,
      };
    })
    .filter((showcase): showcase is AirFreshenerShowcase => showcase !== null)
    .filter((showcase) => showcase.images.length > 0);

  return { clubs, showcases };
}

export async function getAirFreshenerPageDataFromStore(): Promise<AirFreshenerPageData> {
  try {
    const fromDb = await readAirFreshenerPageDataFromDb();
    if (fromDb && fromDb.clubs.length > 0 && fromDb.showcases.length > 0) {
      return fromDb;
    }
  } catch (error) {
    console.error("Failed to load air freshener showcases from database, using fallback.", error);
  }

  return fallbackData();
}
