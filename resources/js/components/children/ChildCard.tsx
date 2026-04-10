import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { destroy as childrenDestroy, show as childrenShow, restrictions } from '@/routes/children';
import { TrashIcon, UserIcon, EyeIcon, ShieldIcon } from 'lucide-react';
import { useState } from 'react';

export interface Child {
  id: number;
  name: string;
  email: string;
  balance: string;
  created_at: string;
}

interface ChildCardProps {
  child: Child;
}

export function ChildCard({ child }: ChildCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    router.delete(childrenDestroy.url(child.id), {
      onStart: () => setIsDeleting(true),
      onFinish: () => setIsDeleting(false),
    });
  };

  const handleViewDashboard = () => {
    router.visit(childrenShow.url(child.id));
  };

  const handleViewRestrictions = () => {
    router.visit(restrictions.index.url(child.id));
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
    <Card>
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
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Desvinculando...' : 'Desvincular'}
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
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={handleViewDashboard}
            >
              <EyeIcon className="h-4 w-4" />
              Ver dashboard
            </Button>
          </div>
          <div>
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={handleViewRestrictions}
            >
              <ShieldIcon className="h-4 w-4" />
              Restricciones
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
