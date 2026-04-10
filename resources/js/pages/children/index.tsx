import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { index as childrenIndex, destroy as childrenDestroy } from '@/routes/children';
import { PlusIcon, TrashIcon, UserIcon } from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface Child {
  id: number;
  name: string;
  email: string;
  balance: string;
  created_at: string;
}

interface ChildrenIndexProps {
  children: Child[];
}

export default function ChildrenIndex({ children }: ChildrenIndexProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingChild, setDeletingChild] = useState<number | null>(null);

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

  const handleDelete = (childId: number) => {
    router.delete(childrenDestroy.url(childId), {
      onStart: () => setDeletingChild(childId),
      onFinish: () => setDeletingChild(null),
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
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
              <Card key={child.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{child.name}</CardTitle>
                        <CardDescription className="text-xs">{child.email}</CardDescription>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Eliminar cuenta</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Desvincular cuenta hijo?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción desvinculará la cuenta de {child.name}. El historial de gastos se conservará.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(child.id)}
                            disabled={deletingChild === child.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingChild === child.id
                              ? 'Desvinculando...'
                              : 'Desvincular'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Saldo disponible</span>
                      <span className="text-lg font-semibold">{formatCurrency(child.balance)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Creada el</span>
                      <span className="text-sm">{formatDate(child.created_at)}</span>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" className="w-full" size="sm">
                        Ver dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
