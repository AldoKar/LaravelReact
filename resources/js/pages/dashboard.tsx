import { Head } from '@inertiajs/react';
import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
} from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import { dashboard } from '@/routes';
import { ExpenseFormDialog } from '@/components/expenses';

Chart.register(
    CategoryScale,
    LinearScale,
    LineController,
    BarController,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
);

type ExpensePeriod = 'day' | 'week' | 'month';

type ExpenseSummaryItem = {
    key: string;
    label: string;
    total: number;
};

export default function Dashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState<ExpensePeriod>('day');
    const [summary, setSummary] = useState<ExpenseSummaryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadSummary = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/expenses/summary?period=${selectedPeriod}&periods=10`,
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error('No se pudo cargar el resumen de gastos.');
                }

                const payload = await response.json();
                setSummary(payload.data ?? []);
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    setError(
                        error instanceof Error
                            ? error.message
                            : 'No se pudo cargar el resumen de gastos.',
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        void loadSummary();

        return () => controller.abort();
    }, [selectedPeriod]);

    useEffect(() => {
        if (!chartRef.current) {
            return;
        }

        chartInstanceRef.current?.destroy();

        chartInstanceRef.current = new Chart(chartRef.current, {
            type: 'line',
            data: {
                labels: summary.map((item) => item.label),
                datasets: [
                    {
                        label: 'Total de gastos',
                        data: summary.map((item) => item.total),
                        borderColor: 'rgba(14, 116, 144, 1)',
                        backgroundColor: 'rgba(14, 116, 144, 0.15)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

        return () => {
            chartInstanceRef.current?.destroy();
            chartInstanceRef.current = null;
        };
    }, [summary]);

    const totalExpenses = summary.reduce((carry, item) => carry + item.total, 0);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <ExpenseFormDialog />
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-sidebar-border/70 p-3 dark:border-sidebar-border">
                    {(['day', 'week', 'month'] as ExpensePeriod[]).map((period) => (
                        <button
                            key={period}
                            type="button"
                            onClick={() => setSelectedPeriod(period)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedPeriod === period
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                        >
                            {period === 'day' && 'Día'}
                            {period === 'week' && 'Semana'}
                            {period === 'month' && 'Mes'}
                        </button>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">
                            Total de gastos
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {loading ? 'Cargando...' : `$${totalExpenses.toFixed(2)}`}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Vista por {selectedPeriod === 'day' ? 'día' : selectedPeriod === 'week' ? 'semana' : 'mes'}
                        </p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">Periodo seleccionado</p>
                        <p className="mt-2 text-2xl font-semibold capitalize">{selectedPeriod}</p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">Puntos en el gráfico</p>
                        <p className="mt-2 text-2xl font-semibold">{summary.length}</p>
                    </div>
                </div>

                {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        {error}
                    </div>
                ) : null}

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-base font-semibold">
                            Gastos totales por {selectedPeriod === 'day' ? 'día' : selectedPeriod === 'week' ? 'semana' : 'mes'}
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            Últimos 10 periodos
                        </span>
                    </div>
                    <div className="mt-4 h-96">
                        <canvas ref={chartRef} />
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="text-base font-semibold">
                            Resumen actual
                        </h2>
                        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                            {summary.slice(-5).map((item) => (
                                <div key={item.key} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                                    <span>{item.label}</span>
                                    <span className="font-medium text-foreground">${item.total.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="text-base font-semibold">Estado</h2>
                        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                            <p>Los datos vienen desde <code>/expenses/summary</code> usando la función nueva del backend.</p>
                            <p>El botón cambia entre vista por día, semana y mes sin salir del dashboard.</p>
                            <p>Si quieres, luego puedo conectar este mismo endpoint a filtros más avanzados o a cards separadas por categoría.</p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
