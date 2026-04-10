import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { travel } from '@/routes';

export default function Travel() {
    return (
        <>
            <Head title="Capital Travel" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <section className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Capital Travel
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Gestiona viajes y presupuestos familiares.
                    </p>
                </section>

                <section className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-medium">Viajes</h2>
                        <Button type="button">Crear viaje</Button>
                    </div>

                    <div className="mt-4 rounded-lg border border-dashed border-sidebar-border/70 p-4 text-sm text-muted-foreground dark:border-sidebar-border">
                        Aun no tienes viajes registrados.
                    </div>
                </section>
            </div>
        </>
    );
}

Travel.layout = {
    breadcrumbs: [
        {
            title: 'Capital Travel',
            href: travel(),
        },
    ],
};
