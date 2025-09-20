// pages/demo/vendor/index.tsx
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";

type Service = {
  id: string;
  name: string;
  price?: number | null;
  startsFrom?: number | null;
  description?: string | null;
};

type Provider = {
  id: string;
  name: string;
  logoUrl?: string | null;
  category?: string | null;
  city?: string | null;
  rating?: number | null;
  services?: Service[] | null;
};

type ProvidersResponse = {
  items: Provider[];
  total: number;
  page: number;
  pageSize: number;
};

type ViewMode = "grid" | "table";

interface PageProps extends ProvidersResponse {
  q: string;
  view: ViewMode;
  error?: string | null;
}

function buildBaseUrl(reqHost?: string) {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  const host = reqHost || "localhost:3000";
  const proto =
    host.includes("localhost") || host.startsWith("192.168.") ? "http" : "https";
  return `${proto}://${host}`;
}

function buildUrl(
  base: string,
  path: string,
  params: Record<string, string | number | undefined>
) {
  const url = new URL(path, base);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  });
  return url.toString();
}

export const getServerSideProps: GetServerSideProps<
  PageProps,
  ParsedUrlQuery
> = async (ctx) => {
  const q = (ctx.query.q as string) || "";
  const page = Number(ctx.query.page || 1);
  const view = ((ctx.query.view as ViewMode) || "grid") as ViewMode;

  const hostHeader = ctx.req.headers["x-forwarded-host"] || ctx.req.headers.host;
  const base = buildBaseUrl(typeof hostHeader === "string" ? hostHeader : undefined);

  try {
    const url = buildUrl(base, "/api/providers", {
      search: q,
      page,
      include: "services",
    });

    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to load providers (${res.status}) ${text}`);
    }

    const data = (await res.json()) as ProvidersResponse;

    const pageSize = data.pageSize || 9;
    const pageFix = data.page || page;

    return {
      props: {
        items: data.items || [],
        total: data.total ?? (data.items ? data.items.length : 0),
        page: pageFix,
        pageSize,
        q,
        view,
        error: null,
      },
    };
  } catch (err: any) {
    return {
      props: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        q,
        view,
        error: err?.message || "Unknown error",
      },
    };
  }
};

const VendorDemoIndex: NextPage<PageProps> = ({
  items,
  total,
  page,
  pageSize,
  q,
  view,
  error,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const makeHref = (params: Partial<{ q: string; page: number; view: ViewMode }>) => {
    const usp = new URLSearchParams();
    usp.set("q", params.q ?? q);
    usp.set("page", String(params.page ?? page));
    usp.set("view", (params.view ?? view) as string);
    return `/demo/vendor?${usp.toString()}`;
  };

  return (
    <main className="light-page mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold text-gradient">Vendor Demo</h1>

        <div className="flex flex-wrap items-center gap-2">
          <form className="flex items-center gap-2" action="/demo/vendor" method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="ابحث عن مزود أو خدمة…"
              className="input-field"
            />
            <input type="hidden" name="view" value={view} />
            <button className="btn btn-outline">بحث</button>
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={makeHref({ view: "grid" })}
              className={`btn btn-sm ${view === "grid" ? "btn-gradient" : "btn-ghost"}`}
            >
              Grid
            </Link>
            <Link
              href={makeHref({ view: "table" })}
              className={`btn btn-sm ${view === "table" ? "btn-gradient" : "btn-ghost"}`}
            >
              Table
            </Link>
          </div>
        </div>
      </header>

      {error ? (
        <div className="light-card border-red-300 bg-red-50 text-red-700 p-4">
          {error} — <a href="/demo/vendor" className="underline">Retry</a>
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-400">لا يوجد مزودين.</p>
      ) : view === "grid" ? (
        <section className="grid-responsive">
          {items.map((v) => (
            <article key={v.id} className="card card-hover p-4 animate-fade-in">
              <div className="flex items-center gap-3">
                {v.logoUrl ? (
                  <img
                    src={v.logoUrl}
                    alt={v.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-radial text-sm">
                    {v.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-gradient">{v.name}</h2>
                  <p className="text-sm text-gray-400">
                    {(v.category ?? "General") + (v.city ? ` • ${v.city}` : "")}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-300">
                {typeof v.rating === "number"
                  ? `⭐ ${v.rating.toFixed(1)}/5`
                  : "No rating yet"}
              </div>

              {v.services?.length ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {v.services.slice(0, 3).map((s) => (
                    <li key={s.id} className="flex items-center justify-between">
                      <span>{s.name}</span>
                      {s.startsFrom ?? s.price ? (
                        <span className="badge badge-primary">
                          من {s.startsFrom ?? s.price} SAR
                        </span>
                      ) : null}
                    </li>
                  ))}
                  {v.services.length > 3 && (
                    <li className="text-xs text-gray-500">
                      +{v.services.length - 3} خدمات إضافية
                    </li>
                  )}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-gray-500">لا توجد خدمات.</p>
              )}

              <div className="mt-4">
                <Link
                  href={`/demo/vendor/services?q=${encodeURIComponent(v.name)}`}
                  className="btn-gradient text-sm"
                >
                  عرض الخدمات
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="overflow-x-auto rounded-2xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-left">
              <tr>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Services</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id} className="border-t border-gray-700">
                  <td className="px-4 py-3">{v.name}</td>
                  <td className="px-4 py-3">{v.category ?? "-"}</td>
                  <td className="px-4 py-3">{v.city ?? "-"}</td>
                  <td className="px-4 py-3">{v.services?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/demo/vendor/services?q=${encodeURIComponent(v.name)}`}
                      className="btn btn-sm btn-outline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <nav className="mt-6 flex items-center justify-center gap-2">
        <Link
          aria-disabled={page <= 1}
          href={makeHref({ page: Math.max(1, page - 1) })}
          className={`btn btn-sm btn-outline ${
            page <= 1 ? "pointer-events-none opacity-40" : ""
          }`}
        >
          Prev
        </Link>
        <span className="text-sm text-gray-400">
          Page {page} / {totalPages}
        </span>
        <Link
          aria-disabled={page >= totalPages}
          href={makeHref({ page: Math.min(totalPages, page + 1) })}
          className={`btn btn-sm btn-outline ${
            page >= totalPages ? "pointer-events-none opacity-40" : ""
          }`}
        >
          Next
        </Link>
      </nav>
    </main>
  );
};

export default VendorDemoIndex;
