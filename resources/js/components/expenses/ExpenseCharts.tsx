import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Expense } from '@/components/expenses/ExpenseForm';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// Category color palette — vibrant, harmonious
const CATEGORY_COLORS: Record<string, { bg: string; border: string }> = {
  'Alimentación': { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgb(239, 68, 68)' },
  'Transporte': { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgb(59, 130, 246)' },
  'Entretenimiento': { bg: 'rgba(168, 85, 247, 0.7)', border: 'rgb(168, 85, 247)' },
  'Salud': { bg: 'rgba(34, 197, 94, 0.7)', border: 'rgb(34, 197, 94)' },
  'Educación': { bg: 'rgba(234, 179, 8, 0.7)', border: 'rgb(234, 179, 8)' },
  'Hogar': { bg: 'rgba(249, 115, 22, 0.7)', border: 'rgb(249, 115, 22)' },
  'Ropa': { bg: 'rgba(236, 72, 153, 0.7)', border: 'rgb(236, 72, 153)' },
  'Otros': { bg: 'rgba(107, 114, 128, 0.7)', border: 'rgb(107, 114, 128)' },
  // Fallback for any categories from seed data that don't match
  'Medical & Pharmacy': { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgb(239, 68, 68)' },
  'Debt & Interest': { bg: 'rgba(107, 114, 128, 0.7)', border: 'rgb(107, 114, 128)' },
  'Books & Media': { bg: 'rgba(168, 85, 247, 0.7)', border: 'rgb(168, 85, 247)' },
  'Digital Services': { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgb(59, 130, 246)' },
  'Hobbies': { bg: 'rgba(234, 179, 8, 0.7)', border: 'rgb(234, 179, 8)' },
  'Clothing & Accessories': { bg: 'rgba(236, 72, 153, 0.7)', border: 'rgb(236, 72, 153)' },
  'Fitness & Wellness': { bg: 'rgba(34, 197, 94, 0.7)', border: 'rgb(34, 197, 94)' },
  'Dining Out': { bg: 'rgba(249, 115, 22, 0.7)', border: 'rgb(249, 115, 22)' },
  'Home Maintenance': { bg: 'rgba(14, 165, 233, 0.7)', border: 'rgb(14, 165, 233)' },
  'Public Transit & Rideshare': { bg: 'rgba(99, 102, 241, 0.7)', border: 'rgb(99, 102, 241)' },
};

const DEFAULT_COLOR = { bg: 'rgba(156, 163, 175, 0.7)', border: 'rgb(156, 163, 175)' };

function getColor(category: string) {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR;
}

interface ExpenseChartsProps {
  expenses: Expense[];
}

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  const getCategoryName = (expense: Expense) =>
    expense.category?.name ?? 'Sin categoría';

  // ─── Data: Gastos por Fecha (Line chart) ──────────────────────────
  const dateData = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach((e) => {
      const date = e.date;
      grouped[date] = (grouped[date] || 0) + parseFloat(e.amount);
    });

    // Sort by date ascending
    const sorted = Object.entries(grouped).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
    );

    const labels = sorted.map(([date]) =>
      new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
      }),
    );
    const values = sorted.map(([, v]) => v);

    return {
      labels,
      datasets: [
        {
          label: 'Gasto diario',
          data: values,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [expenses]);

  // ─── Data: Gastos por Categoría (Doughnut chart) ──────────────────
  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach((e) => {
      const categoryName = getCategoryName(e);
      grouped[categoryName] = (grouped[categoryName] || 0) + parseFloat(e.amount);
    });

    const sorted = Object.entries(grouped).sort(([, a], [, b]) => b - a);
    const labels = sorted.map(([cat]) => cat);
    const values = sorted.map(([, v]) => v);
    const bgColors = labels.map((cat) => getColor(cat).bg);
    const borderColors = labels.map((cat) => getColor(cat).border);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  }, [expenses]);

  // ─── Data: Top Gastos por Monto (Bar chart) ───────────────────────
  const amountData = useMemo(() => {
    const sorted = [...expenses]
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 10);

    const labels = sorted.map(
      (e) => {
        const categoryName = getCategoryName(e);

        return `${categoryName.substring(0, 12)}${categoryName.length > 12 ? '…' : ''} (${new Date(e.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })})`;
      },
    );
    const values = sorted.map((e) => parseFloat(e.amount));
    const bgColors = sorted.map((e) => getColor(getCategoryName(e)).bg);
    const borderColors = sorted.map((e) => getColor(getCategoryName(e)).border);

    return {
      labels,
      datasets: [
        {
          label: 'Monto',
          data: values,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };
  }, [expenses]);

  // ─── Chart Options ────────────────────────────────────────────────
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx: any) =>
            `$${ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#9ca3af' },
      },
      y: {
        grid: { color: 'rgba(156,163,175,0.15)' },
        ticks: {
          font: { size: 11 },
          color: '#9ca3af',
          callback: (v: any) => `$${v.toLocaleString()}`,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        callbacks: {
          label: (ctx: any) => {
            const total = ctx.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return `${ctx.label}: $${ctx.parsed.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${pct}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        callbacks: {
          label: (ctx: any) =>
            `$${ctx.parsed.x.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(156,163,175,0.15)' },
        ticks: {
          font: { size: 11 },
          color: '#9ca3af',
          callback: (v: any) => `$${v.toLocaleString()}`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#9ca3af' },
      },
    },
  };

  // ─── Aggregate stats ──────────────────────────────────────────────
  const totalGasto = useMemo(
    () => expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
    [expenses],
  );
  const avgGasto = useMemo(
    () => (expenses.length > 0 ? totalGasto / expenses.length : 0),
    [expenses, totalGasto],
  );
  const maxGasto = useMemo(
    () =>
      expenses.length > 0
        ? Math.max(...expenses.map((e) => parseFloat(e.amount)))
        : 0,
    [expenses],
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(n);

  if (expenses.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalGasto)}</p>
            <p className="text-xs text-muted-foreground">
              {expenses.length} transacciones
            </p>
          </CardContent>
        </Card>
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Promedio por Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(avgGasto)}</p>
            <p className="text-xs text-muted-foreground">por transacción</p>
          </CardContent>
        </Card>
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Gasto Máximo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(maxGasto)}</p>
            <p className="text-xs text-muted-foreground">mayor transacción</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Line Chart — Gastos por Fecha */}
        <Card className="lg:col-span-2 border-sidebar-border/70 dark:border-sidebar-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Gastos por Fecha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <Line data={dateData} options={lineOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Doughnut Chart — Gastos por Categoría */}
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Gastos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <Doughnut data={categoryData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart — Top Gastos por Monto */}
        <Card className="lg:col-span-3 border-sidebar-border/70 dark:border-sidebar-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Top 10 Gastos por Monto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <Bar data={amountData} options={barOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
