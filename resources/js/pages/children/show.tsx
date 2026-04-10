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
import { useEffect, useRef, useState, useMemo } from 'react';
import { index as childrenIndex } from '@/routes/children';
import { ArrowLeftIcon, BarChart3Icon, ReceiptIcon, FilterIcon, XIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExpenseCharts } from '@/components/expenses/ExpenseCharts';
import { GiveMoneyDialog } from '@/components/children';

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

interface Expense {
    id: number;
    amount: string;
    category: {
        id: number;
        name: string;
    };
    description: string | null;
    date: string;
    created_at: string;
}

interface TargetUser {
    id: number;
    name: string;
    balance: number;
    role: string;
}

interface ChildShowProps {
    targetUser: TargetUser;
    expenses: Expense[];
}

export default function ChildShow({ targetUser, expenses }: ChildShowProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPeriod, setSelectedPeriod] = useState<ExpensePeriod>('day');
    const [summary, setSummary] = useState<ExpenseSummaryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadSummary = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/expenses/summary?period=${selectedPeriod}&periods=10&child_id=${targetUser.id}`,
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
    }, [selectedPeriod, targetUser.id]);

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Get unique categories
    const categories = useMemo(() => {
        return Array.from(new Set(expenses.map((expense) => expense.category?.name).filter(Boolean)));
    }, [expenses]);

    // Filter expenses
    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => {
            // Category filter
            if (categoryFilter !== 'all' && expense.category?.name !== categoryFilter) {
                return false;
            }

            // Date range filter
            if (startDate && expense.date < startDate) {
                return false;
            }
            if (endDate && expense.date > endDate) {
                return false;
            }

            return true;
        });
    }, [expenses, categoryFilter, startDate, endDate]);

    const clearFilters = () => {
        setCategoryFilter('all');
        setStartDate('');
        setEndDate('');
    };

    const hasActiveFilters = categoryFilter !== 'all' || startDate !== '' || endDate !== '';

    return (
        <>
            <Head title={`Dashboard - ${targetUser.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={childrenIndex()}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeftIcon className="h-5 w-5" />
                                <span className="sr-only">Volver</span>
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold">Dashboard de {targetUser.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                Saldo disponible: {formatCurrency(targetUser.balance)}
                            </p>
                        </div>
                    </div>
                    <GiveMoneyDialog child={targetUser} />
                </div>

                <Tabs value={activeTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger
                            active={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                        >
                            <BarChart3Icon className="mr-2 h-4 w-4" />
                            Resumen
                        </TabsTrigger>
                        <TabsTrigger
                            active={activeTab === 'expenses'}
                            onClick={() => setActiveTab('expenses')}
                        >
                            <ReceiptIcon className="mr-2 h-4 w-4" />
                            Gastos
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className={activeTab === 'overview' ? 'block' : 'hidden'}>
                        <div className="space-y-4">
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
                                        {loading ? 'Cargando...' : formatCurrency(totalExpenses)}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Vista por {selectedPeriod === 'day' ? 'día' : selectedPeriod === 'week' ? 'semana' : 'mes'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                    <p className="text-sm text-muted-foreground">Saldo disponible</p>
                                    <p className="mt-2 text-2xl font-semibold">{formatCurrency(targetUser.balance)}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Cuenta hijo</p>
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
                                                <span className="font-medium text-foreground">{formatCurrency(item.total)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                    <h2 className="text-base font-semibold">Información</h2>
                                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                                        <p>Este es el dashboard de {targetUser.name}.</p>
                                        <p>Puedes ver todos sus gastos organizados por período.</p>
                                        <p>El saldo disponible se actualiza cuando apruebas solicitudes de dinero o misiones completadas.</p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="expenses" className={activeTab === 'expenses' ? 'block' : 'hidden'}>
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Gastos de {targetUser.name}</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <FilterIcon className="h-4 w-4" />
                                    Filtros
                                    {hasActiveFilters && (
                                        <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                                            {[categoryFilter !== 'all', startDate, endDate].filter(Boolean).length}
                                        </span>
                                    )}
                                </Button>
                            </div>

                            {/* Filters Panel */}
                            {showFilters && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="category-filter">Categoría</Label>
                                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                                    <SelectTrigger id="category-filter">
                                                        <SelectValue placeholder="Todas las categorías" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="start-date">Fecha inicio</Label>
                                                <Input
                                                    id="start-date"
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="end-date">Fecha fin</Label>
                                                <Input
                                                    id="end-date"
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {hasActiveFilters && (
                                            <div className="mt-4 flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground">
                                                    Mostrando {filteredExpenses.length} de {expenses.length} gastos
                                                </p>
                                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                                    <XIcon className="h-4 w-4" />
                                                    Limpiar filtros
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Expense Charts */}
                            <ExpenseCharts expenses={filteredExpenses} />

                            {/* Expense Table */}
                            <section className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                <h2 className="text-base font-semibold mb-4">Todos los gastos</h2>
                                {filteredExpenses.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            {hasActiveFilters
                                                ? 'No hay gastos que coincidan con los filtros'
                                                : 'No hay gastos registrados'}
                                        </p>
                                        {hasActiveFilters && (
                                            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                                                <XIcon className="h-4 w-4" />
                                                Limpiar filtros
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-sidebar-border/70 text-left text-sm text-muted-foreground">
                                                    <th className="pb-3 font-medium">Fecha</th>
                                                    <th className="pb-3 font-medium">Categoría</th>
                                                    <th className="pb-3 font-medium">Descripción</th>
                                                    <th className="pb-3 font-medium text-right">Monto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredExpenses.map((expense) => (
                                                    <tr key={expense.id} className="border-b border-sidebar-border/70 last:border-0">
                                                        <td className="py-3 text-sm">
                                                            {new Date(expense.date).toLocaleDateString('es-ES', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </td>
                                                        <td className="py-3 text-sm">
                                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                                {expense.category.name}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-sm text-muted-foreground">
                                                            {expense.description || '—'}
                                                        </td>
                                                        <td className="py-3 text-right text-sm font-medium">
                                                            {formatCurrency(parseFloat(expense.amount))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

ChildShow.layout = {
    breadcrumbs: [
        {
            title: 'Cuentas Hijo',
            href: childrenIndex(),
        },
        {
            title: 'Dashboard',
        },
    ],
};
