import { Head, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { capitalFamily } from '@/routes';

export default function CapitalFamily() {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOpen(false);
        setForm({
            name: '',
            email: '',
            phone: '',
            password: '',
        });
    };

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
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button type="button">Agregar</Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>
                                        Crear Cuenta de Hijo
                                    </DialogTitle>
                                    <DialogDescription>
                                        Completa los datos para crear una nueva
                                        cuenta.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={submit} className="mt-2">
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="child-name">
                                                Nombre
                                            </FieldLabel>
                                            <Input
                                                id="child-name"
                                                type="text"
                                                required
                                                autoFocus
                                                autoComplete="name"
                                                value={form.name}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        name: event.target.value,
                                                    }))
                                                }
                                                placeholder="Nombre completo"
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="child-email">
                                                Correo
                                            </FieldLabel>
                                            <Input
                                                id="child-email"
                                                type="email"
                                                required
                                                autoComplete="email"
                                                value={form.email}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        email: event.target.value,
                                                    }))
                                                }
                                                placeholder="correo@ejemplo.com"
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="child-phone">
                                                Teléfono
                                            </FieldLabel>
                                            <Input
                                                id="child-phone"
                                                type="tel"
                                                required
                                                autoComplete="tel"
                                                value={form.phone}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        phone: event.target.value,
                                                    }))
                                                }
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="child-password">
                                                Contrasena
                                            </FieldLabel>
                                            <Input
                                                id="child-password"
                                                type="password"
                                                required
                                                autoComplete="new-password"
                                                value={form.password}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        password:
                                                            event.target.value,
                                                    }))
                                                }
                                                placeholder="Minimo 8 caracteres"
                                            />
                                        </Field>
                                    </FieldGroup>

                                    <DialogFooter className="mt-6">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                            >
                                                Cancelar
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit">
                                            Crear Cuenta de Hijo
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
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
