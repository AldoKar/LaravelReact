import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { capitalFamily } from '@/routes';

export default function CapitalFamily() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Capital Family" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <section className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Capital Family
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Usuario actual: {auth.user.name}
                    </p>
                </section>

                <section className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-medium">Tu familia</h2>
                        <Button type="button">Agregar</Button>
                    </div>

                    <div className="mt-4 rounded-lg border border-dashed border-sidebar-border/70 p-4 text-sm text-muted-foreground dark:border-sidebar-border">
                        Aun no tienes familiares registrados.
                    </div>
                </section>
            </div>
        </>
    );
}

CapitalFamily.layout = {
    breadcrumbs: [
        {
            title: 'Capital Family',
            href: capitalFamily(),
        },
    ],
};
