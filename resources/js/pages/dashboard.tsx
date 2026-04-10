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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WalletIcon, UsersIcon, CircleDollarSign } from 'lucide-react';

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

type CurrentUser = {
    id: number;
    name: string;
    role: 'parent' | 'child';
    balance: number;
};

type Child = {
    id: number;
    nombre: string;
    monto: number;
    avatar: string;
};

type Category = {
    id: number;
    name: string;
};

type CategoryRestriction = {
    id: number;
    category: Category;
    type: 'blocked' | 'limited';
    monthly_limit: number | null;
};

type DashboardProps = {
    currentUser: CurrentUser;
    children: Child[];
    categoryRestrictions: CategoryRestriction[];
};

export default function Dashboard({ currentUser, children, categoryRestrictions }: DashboardProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<ExpensePeriod>('day');
    const [summaryRefreshToken, setSummaryRefreshToken] = useState(0);
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
    }, [selectedPeriod, summaryRefreshToken]);

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <>
            <Head title="Dashboard Principal" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Finanzas de la Familia</h1>
                        <p className="text-muted-foreground mt-1">
                            Resumen de tus cuentas y las de tus hijos.
                        </p>
                    </div>
                </div>

                {/* ─── TARJETAS DE RESUMEN (SUPABASE DATA) ───────────────────── */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Conditional rendering based on user role */}
                    {currentUser.role === 'child' ? (
                        // Child user: Show available balance
                        <Card className="border-sidebar-border dark:border-sidebar-border shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Saldo Disponible
                                </CardTitle>
                                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(currentUser.balance)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tu dinero disponible
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        // Parent user: Show available money and children count
                        <>
                            {/* Mi Dinero / Monto Disponible */}
                            <Card className="border-sidebar-border dark:border-sidebar-border shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Dinero Disponible
                                    </CardTitle>
                                    <WalletIcon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">
                                        {formatCurrency(currentUser.balance)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Saldo actual en tu cuenta
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Conteo de Hijos */}
                            <Card className="border-sidebar-border dark:border-sidebar-border shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Mis Hijos
                                    </CardTitle>
                                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {children.length}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Cuentas de menores vinculadas
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* ─── CATEGORY RESTRICTIONS FOR CHILD USERS ───────────────────── */}
                {currentUser.role === 'child' && categoryRestrictions.length > 0 && (
                    <Card className="border-sidebar-border dark:border-sidebar-border shadow-sm">
                        <CardHeader>
                            <CardTitle>Restricciones Activas</CardTitle>
                            <CardDescription>
                                Categorías con límites o bloqueos configurados por tu padre
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {categoryRestrictions.map((restriction) => (
                                    <div
                                        key={restriction.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{restriction.category.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {restriction.type === 'blocked'
                                                    ? 'Bloqueada - No puedes registrar gastos'
                                                    : `Límite mensual: ${formatCurrency(restriction.monthly_limit || 0)}`}
                                            </p>
                                        </div>
                                        <div
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                restriction.type === 'blocked'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200'
                                            }`}
                                        >
                                            {restriction.type === 'blocked' ? 'Bloqueada' : 'Limitada'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* ─── LISTA DE ALUMNOS / HIJOS (only for parents) ────────────────────────────── */}
                    {currentUser.role === 'parent' && children.length > 0 && (
                        <Card className="col-span-1 border-sidebar-border dark:border-sidebar-border shadow-sm flex flex-col">
                            <CardHeader>
                                <CardTitle>Cuentas de los Hijos</CardTitle>
                                <CardDescription>
                                    Balances actuales de tus hijos.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-6">
                                    {children.map((hijo) => (
                                        <div key={hijo.id} className="flex items-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                                {hijo.avatar}
                                            </div>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{hijo.nombre}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Cuenta vinculada
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(hijo.monto)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ─── GRÁFICO DE GASTOS ORIGINAL ──────────────────────────── */}
                    <Card className={`col-span-1 ${currentUser.role === 'parent' && children.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} border-sidebar-border dark:border-sidebar-border shadow-sm`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Actividad de Gastos</CardTitle>
                                <CardDescription>Tus gastos en la plataforma</CardDescription>
                            </div>
                            <ExpenseFormDialog onSuccess={() => setSummaryRefreshToken((token) => token + 1)} />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                {(['day', 'week', 'month'] as ExpensePeriod[]).map((period) => (
                                    <button
                                        key={period}
                                        type="button"
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${selectedPeriod === period
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

                            {error ? (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4">
                                    {error}
                                </div>
                            ) : null}

                            <div className="h-[250px] w-full">
                                {loading ? (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        Cargando gráfica...
                                    </div>
                                ) : (
                                    <canvas ref={chartRef} />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Principal',
            href: dashboard(),
        },
    ],
};
