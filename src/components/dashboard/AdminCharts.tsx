"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ORANGE = "#ff6600";
const NAVY = "#0a1628";
const COLORS = [ORANGE, "#0a1628", "#f59e0b", "#10b981", "#6366f1", "#ec4899"];

type Props = {
  chart7days: { day: string; entrees: number; sorties: number }[];
  byCategory: { name: string; produits: number; stock: number }[];
  byRole: { name: string; value: number }[];
  hasMovements?: boolean;
  hasCatalog?: boolean;
};

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl bg-base-200/50 px-4 text-center text-sm opacity-60">
      {message}
    </div>
  );
}

export function AdminCharts({
  chart7days,
  byCategory,
  byRole,
  hasMovements = false,
  hasCatalog = false,
}: Props) {
  const hasWeekActivity = chart7days.some(
    (d) => d.entrees > 0 || d.sorties > 0,
  );

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      <section className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Mouvements (7 derniers jours)
        </h2>
        {!hasMovements || !hasWeekActivity ? (
          <EmptyChart message="Aucun mouvement enregistré pour le moment." />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart7days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="entrees"
                  name="Entrées"
                  fill={ORANGE}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="sorties"
                  name="Sorties"
                  fill={NAVY}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <h2 className="mb-4 text-lg font-semibold">Produits par catégorie</h2>
        {!hasCatalog || byCategory.length === 0 ? (
          <EmptyChart message="Ajoutez des produits pour voir ce graphique." />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="produits"
                  name="Produits"
                  fill={ORANGE}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-5 xl:col-span-2">
        <h2 className="mb-4 text-lg font-semibold">
          Répartition des utilisateurs
        </h2>
        <div className="mx-auto h-64 w-full max-w-md">
          {byRole.length === 0 ? (
            <EmptyChart message="Aucun utilisateur." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byRole}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {byRole.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
