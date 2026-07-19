import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";
import { fr } from "date-fns/locale";

export async function getStockReportRows() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true, supplier: true },
    orderBy: { name: "asc" },
  });

  return products.map((p) => {
    const qty = p.quantity;
    const purchase = Number(p.purchasePrice);
    const sale = Number(p.salePrice);
    const status =
      qty === 0 ? "Rupture" : qty <= p.alertThreshold ? "Bas" : "OK";

    return {
      sku: p.sku,
      name: p.name,
      category: p.category.name,
      supplier: p.supplier?.name ?? "—",
      unit: p.unit,
      quantity: qty,
      alertThreshold: p.alertThreshold,
      purchasePrice: purchase,
      salePrice: sale,
      stockValue: qty * purchase,
      status,
    };
  });
}

export async function getMovementsReportRows(days = 30) {
  const from = startOfDay(subDays(new Date(), days));
  const movements = await prisma.stockMovement.findMany({
    where: { createdAt: { gte: from } },
    include: {
      product: { select: { sku: true, name: true } },
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return movements.map((m) => ({
    date: format(m.createdAt, "dd/MM/yyyy HH:mm", { locale: fr }),
    type: m.type,
    sku: m.product.sku,
    product: m.product.name,
    quantity: m.quantity,
    before: m.quantityBefore,
    after: m.quantityAfter,
    reason: m.reason,
    reference: m.reference ?? "—",
    user: m.user.name,
  }));
}

export async function getLowStockReportRows() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { quantity: "asc" },
  });

  return products
    .filter((p) => p.quantity <= p.alertThreshold)
    .map((p) => ({
      sku: p.sku,
      name: p.name,
      category: p.category.name,
      quantity: p.quantity,
      alertThreshold: p.alertThreshold,
      status: p.quantity === 0 ? "Rupture" : "Bas",
    }));
}

export async function getAdminDashboardStats() {
  const from7 = startOfDay(subDays(new Date(), 6));
  const from30 = startOfDay(subDays(new Date(), 29));

  const [
    users,
    products,
    categories,
    suppliers,
    productRows,
    movementsTotal,
    movements7,
    movements30,
    usersByRole,
    productsByCategory,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.supplier.count(),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        quantity: true,
        alertThreshold: true,
        purchasePrice: true,
        salePrice: true,
        name: true,
        sku: true,
      },
    }),
    prisma.stockMovement.count(),
    prisma.stockMovement.findMany({
      where: { createdAt: { gte: from7 } },
      select: { type: true, quantity: true, createdAt: true },
    }),
    prisma.stockMovement.findMany({
      where: { createdAt: { gte: from30 } },
      select: { type: true, quantity: true },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { isActive: true },
      _count: { _all: true },
      _sum: { quantity: true },
    }),
  ]);

  const lowStock = productRows.filter((p) => p.quantity <= p.alertThreshold);
  const outOfStock = productRows.filter((p) => p.quantity === 0).length;
  const stockValue = productRows.reduce(
    (sum, p) => sum + p.quantity * Number(p.purchasePrice),
    0,
  );
  const saleValue = productRows.reduce(
    (sum, p) => sum + p.quantity * Number(p.salePrice),
    0,
  );

  const in30 = movements30
    .filter((m) => m.type === "IN")
    .reduce((s, m) => s + m.quantity, 0);
  const out30 = movements30
    .filter((m) => m.type === "OUT")
    .reduce((s, m) => s + m.quantity, 0);

  // Chart: last 7 days IN vs OUT
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = startOfDay(subDays(new Date(), 6 - i));
    const key = format(d, "yyyy-MM-dd");
    const label = format(d, "EEE dd", { locale: fr });
    const dayMoves = movements7.filter(
      (m) => format(startOfDay(m.createdAt), "yyyy-MM-dd") === key,
    );
    return {
      day: label,
      entrees: dayMoves
        .filter((m) => m.type === "IN")
        .reduce((s, m) => s + m.quantity, 0),
      sorties: dayMoves
        .filter((m) => m.type === "OUT")
        .reduce((s, m) => s + m.quantity, 0),
    };
  });

  const categoriesMap = await prisma.category.findMany({
    select: { id: true, name: true },
  });
  const catName = Object.fromEntries(categoriesMap.map((c) => [c.id, c.name]));

  const byCategory = productsByCategory.map((row) => ({
    name: catName[row.categoryId] ?? "Autre",
    produits: row._count._all,
    stock: row._sum.quantity ?? 0,
  }));

  const roleLabels: Record<string, string> = {
    ADMIN: "Admin",
    GESTIONNAIRE: "Gestionnaire",
    MAGASINIER: "Magasinier",
  };

  const byRole = usersByRole.map((r) => ({
    name: roleLabels[r.role] ?? r.role,
    value: r._count._all,
  }));

  return {
    kpis: {
      users,
      products,
      categories,
      suppliers,
      movementsTotal,
      lowStock: lowStock.length,
      outOfStock,
      stockValue,
      saleValue,
      in30,
      out30,
    },
    chart7days: days,
    byCategory,
    byRole,
    lowStockTop: lowStock.slice(0, 6).map((p) => ({
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      alertThreshold: p.alertThreshold,
    })),
  };
}
