import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Gavel,
  Mail,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const retentionRules = [
  {
    title: "Kontakt upiti",
    value: "do 30 dana",
    description:
      "Upite čuvamo najduže mjesec dana radi odgovora i osnovne evidencije, osim kada je dulje čuvanje potrebno zbog pravnih zahtjeva, zastite pravnih interesa ili službenog postupka.",
  },
  {
    title: "Tehnički logovi",
    value: "do 12 mjeseci",
    description: "Svrha je sigurnost sustava i analiza eventualnih incidenata.",
  },
  {
    title: "Zakonski rokovi",
    value: "prema propisima",
    description: "Ako je obrada povezana s pravnim obvezama, podatke čuvamo koliko zakon traži.",
  },
];

const rights = [
  "pravo na pristup osobnim podacima",
  "pravo na ispravak netočnih podataka",
  "pravo na brisanje (ako nema pravne osnove za daljnju obradu)",
  "pravo na ograničenje obrade",
  "pravo na prenosivost podataka",
  "pravo na prigovor obradi kada je osnova legitimni interes",
  "pravo na povlačenje privole bez utjecaja na zakonitost prethodne obrade",
];

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-gray-900 selection:bg-[#4a6bfe] selection:text-white">
      <SiteHeader active="contact" />

      <main className="relative flex-1 overflow-hidden pb-20 pt-36">
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-20 bottom-12 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl"></div>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="relative border-b border-gray-100 px-6 py-10 sm:px-10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-50/80 via-white to-cyan-50/70"></div>
              <div className="relative">
                <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#3555f6]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  GDPR Politika
                </p>
                <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
                  Politika privatnosti i obrada osobnih podataka
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                  Ova politika detaljno objašnjava kako Niko Trade obraduje osobne podatke, posebno
                  podatke iz kontakt upita. Cilj je potpuna transparentnost, zakonitost obrade i
                  zaštita vaših prava u skladu s GDPR uredbom.
                </p>
                <p className="mt-4 text-sm font-semibold text-gray-500">
                  Zadnje ažuriranje: 22.02.2026.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 sm:p-10 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-6">
                <article className="rounded-2xl border border-gray-100 bg-[#FAFBFF] p-6">
                  <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-gray-900">
                    <Database className="h-5 w-5 text-[#4a6bfe]" />
                    Koje podatke prikupljamo
                  </h2>
                  <p className="mt-3 text-gray-600">
                    Kod slanja upita možemo obrađivati: email adresu za odgovor, naslov upita,
                    sadržaj poruke i (ako postoji) oznaku proizvoda na koji se upit odnosi.
                  </p>
                </article>

                <article className="rounded-2xl border border-gray-100 bg-white p-6">
                  <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-gray-900">
                    <Mail className="h-5 w-5 text-[#4a6bfe]" />
                    Zašto koristimo email podatke
                  </h2>
                  <div className="mt-4 space-y-3 text-gray-600">
                    <p>
                      Email adresu koristimo da bismo vam odgovorili na konkretan upit, potvrdili
                      status komunikacije i osigurali da odgovor stigne pravoj osobi.
                    </p>
                    <p>
                      Bez email adrese ne možemo ispuniti osnovnu svrhu kontakt forme:
                      pravovremenu i točnu poslovnu komunikaciju.
                    </p>
                    <p>
                      U slučaju sigurnosnih incidenata ili sporova, podaci o komunikaciji služe i
                      kao dokaz zakonitog i profesionalnog postupanja.
                    </p>
                    <p>
                      Email podatke ne koristimo za slanje marketinških poruka bez vaše izričite
                      privole i obrada je ograničena na svrhu odgovora na upit, sigurnost i
                      potrebnu poslovnu evidenciju.
                    </p>
                  </div>
                </article>

                <article className="rounded-2xl border border-gray-100 bg-white p-6">
                  <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-gray-900">
                    <ShieldCheck className="h-5 w-5 text-[#4a6bfe]" />
                    Pregled vlastitih upita (siguran pristup)
                  </h2>
                  <div className="mt-4 space-y-3 text-gray-600">
                    <p>
                      Za stranicu &quot;Moji upiti&quot; koristimo jednokratni pristupni link poslan
                      na email adresu koju ste naveli kod slanja upita.
                    </p>
                    <p>
                      Nakon potvrde linka postavlja se sigurnosni sesijski kolačić isključivo radi
                      prikaza vaših upita. Kolačić ne koristimo za oglašavanje niti profiliranje.
                    </p>
                    <p>
                      Pristupni token i sesija imaju vremensko ograničenje i služe samo za zaštitu
                      podataka od neovlaštenog pregleda.
                    </p>
                  </div>
                </article>

                <article className="rounded-2xl border border-gray-100 bg-white p-6">
                  <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-gray-900">
                    <TimerReset className="h-5 w-5 text-[#4a6bfe]" />
                    Rokovi čuvanja podataka
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {retentionRules.map((rule) => (
                      <div key={rule.title} className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-gray-500">
                          {rule.title}
                        </p>
                        <p className="mt-1 text-lg font-black text-gray-900">{rule.value}</p>
                        <p className="mt-1 text-sm text-gray-600">{rule.description}</p>
                      </div>
                    ))}
                  </div>
                </article>

              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#3b5af0]">
                    Voditelj obrade
                  </p>
                  <p className="mt-2 text-lg font-black text-gray-900">Niko Trade d.o.o.</p>
                  <p className="mt-2 text-sm text-gray-700">Vatroslava Lisinskog 17, 42233 Sveti Đurđ, Hrvatska</p>
                  <p className="mt-1 text-sm text-gray-700">Email: info@nikotrade.hr</p>
                  <p className="mt-1 text-sm text-gray-700">Telefon: +385 98 241 285</p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
                    <AlertTriangle className="h-4 w-4" />
                    Vazno
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
                    Ne šaljite osjetljive osobne podatke (npr. zdravstvene podatke, OIB, broj kartice)
                    kroz kontakt formu, osim ako to izričito ne zatražimo iz zakonitog razloga.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-gray-500">
                    Prigovor i nadzor
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    Ako smatrate da je obrada podataka nezakonita, možete podnijeti prigovor izravno
                    nama ili nadzornom tijelu (AZOP).
                  </p>
                  <Link
                    href="/kontakt"
                    className="mt-4 inline-flex items-center rounded-lg border border-[#4a6bfe]/20 bg-[#4a6bfe]/10 px-3 py-2 text-sm font-bold text-[#2d4ed8] transition-colors hover:bg-[#4a6bfe]/15"
                  >
                    Kontakt za GDPR zahtjev
                  </Link>
                </div>

                <article className="rounded-2xl border border-gray-100 bg-white p-5">
                  <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-gray-900">
                    <Gavel className="h-5 w-5 text-[#4a6bfe]" />
                    Vaša prava
                  </h2>
                  <ul className="mt-4 space-y-2">
                    {rights.map((right) => (
                      <li key={right} className="flex items-start gap-2 text-gray-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{right}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
