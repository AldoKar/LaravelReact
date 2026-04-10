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
import { useEffect, useRef } from 'react';
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

export default function Dashboard() {
    const personalVsChildrenRef = useRef<HTMLCanvasElement | null>(null);
    const childrenBreakdownRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!personalVsChildrenRef.current || !childrenBreakdownRef.current) {
            return;
        }

        const labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];

        const personalVsChildrenChart = new Chart(personalVsChildrenRef.current, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Gastos Personales (USD)',
                        data: [210, 275, 240, 310],
                        borderColor: 'rgba(14, 116, 144, 1)',
                        backgroundColor: 'rgba(14, 116, 144, 0.15)',
                        fill: true,
                        tension: 0.3,
                    },
                    {
                        label: 'Gastos de Hijos (USD)',
                        data: [165, 190, 220, 205],
                        borderColor: 'rgba(202, 138, 4, 1)',
                        backgroundColor: 'rgba(202, 138, 4, 0.2)',
                        fill: true,
                        tension: 0.3,
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
            },
        });

        const childrenBreakdownChart = new Chart(childrenBreakdownRef.current, {
            type: 'bar',
            data: {
                labels: ['Hijo 1', 'Hijo 2', 'Hijo 3'],
                datasets: [
                    {
                        label: 'Gasto total ultimo mes (USD)',
                        data: [280, 245, 255],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.75)',
                            'rgba(16, 185, 129, 0.75)',
                            'rgba(249, 115, 22, 0.75)',
                        ],
                        borderRadius: 10,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
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
            personalVsChildrenChart.destroy();
            childrenBreakdownChart.destroy();
        };
    }, []);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <ExpenseFormDialog />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">
                            Gasto personal total
                        </p>
                        <p className="mt-2 text-2xl font-semibold">$1,035</p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">
                            Gasto hijos total
                        </p>
                        <p className="mt-2 text-2xl font-semibold">$770</p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">
                            Diferencia del mes
                        </p>
                        <p className="mt-2 text-2xl font-semibold">$265</p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="text-base font-semibold">
                            Ultimo mes: gastos personales vs gastos de hijos
                        </h2>
                        <div className="mt-4 h-80">
                            <canvas ref={personalVsChildrenRef} />
                        </div>
                    </section>

                    <section className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="text-base font-semibold">
                            Gastos por hijo en el ultimo mes
                        </h2>
                        <div className="mt-4 h-80">
                            <canvas ref={childrenBreakdownRef} />
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
