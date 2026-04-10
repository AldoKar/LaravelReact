import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChildCard, type Child } from '@/components/children';
import { index as childrenIndex } from '@/routes/children';
import { PlusIcon, UserIcon } from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface ChildrenIndexProps {
  children: Child[];
}

export default function ChildrenIndex({ children }: ChildrenIndexProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/children', {
      onSuccess: () => {
        reset();
        setIsDialogOpen(false);
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Head title="Cuentas Hijo" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Cuentas Hijo</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona las cuentas de tus hijos vinculadas
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon />
                Crear cuenta hijo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Crear cuenta hijo</DialogTitle>
                  <DialogDescription>
                    Crea una nueva cuenta para tu hijo. Podrás supervisar y controlar sus gastos.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Nombre del hijo"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      placeholder="correo@ejemplo.com"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      aria-invalid={!!errors.password}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={processing}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Creando...' : 'Crear cuenta'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {children.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-sidebar-border/70 p-12 dark:border-sidebar-border">
            <UserIcon className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              No hay cuentas hijo registradas
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea una cuenta para comenzar a supervisar los gastos de tus hijos
            </p>
            <div className="mt-6">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon />
                    Crear primera cuenta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Crear cuenta hijo</DialogTitle>
                      <DialogDescription>
                        Crea una nueva cuenta para tu hijo. Podrás supervisar y controlar sus gastos.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name-empty">Nombre</Label>
                        <Input
                          id="name-empty"
                          value={data.name}
                          onChange={(e) => setData('name', e.target.value)}
                          placeholder="Nombre del hijo"
                          aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email-empty">Correo electrónico</Label>
                        <Input
                          id="email-empty"
                          type="email"
                          value={data.email}
                          onChange={(e) => setData('email', e.target.value)}
                          placeholder="correo@ejemplo.com"
                          aria-invalid={!!errors.email}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password-empty">Contraseña</Label>
                        <Input
                          id="password-empty"
                          type="password"
                          value={data.password}
                          onChange={(e) => setData('password', e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          aria-invalid={!!errors.password}
                        />
                        {errors.password && (
                          <p className="text-sm text-destructive">{errors.password}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={processing}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={processing}>
                        {processing ? 'Creando...' : 'Crear cuenta'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

ChildrenIndex.layout = {
  breadcrumbs: [
    {
      title: 'Cuentas Hijo',
      href: childrenIndex(),
    },
  ],
};
