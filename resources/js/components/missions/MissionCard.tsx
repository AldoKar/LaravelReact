import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrophyIcon, CheckIcon, XIcon, ClockIcon } from 'lucide-react';
import { useState, FormEventHandler } from 'react';

export interface Mission {
  id: number;
  title: string;
  description: string | null;
  reward: number;
  status: 'activa' | 'en_revision' | 'completada' | 'rechazada';
  reject_reason: string | null;
  child?: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface MissionCardProps {
  mission: Mission;
  userRole: 'parent' | 'child';
}

export function MissionCard({ mission, userRole }: MissionCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    reject_reason: '',
  });

  const handleComplete = () => {
    router.post(`/missions/${mission.id}/complete`, {}, {
      onStart: () => setIsCompleting(true),
      onFinish: () => setIsCompleting(false),
    });
  };

  const handleApprove = () => {
    router.post(`/missions/${mission.id}/approve`, {}, {
      onStart: () => setIsApproving(true),
      onFinish: () => setIsApproving(false),
    });
  };

  const handleReject: FormEventHandler = (e) => {
    e.preventDefault();
    post(`/missions/${mission.id}/reject`, {
      onSuccess: () => {
        reset();
        setIsRejectDialogOpen(false);
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = () => {
    switch (mission.status) {
      case 'activa':
        return <Badge variant="default">Activa</Badge>;
      case 'en_revision':
        return <Badge variant="secondary">En revisión</Badge>;
      case 'completada':
        return <Badge variant="outline" className="border-green-500 text-green-500">Completada</Badge>;
      case 'rechazada':
        return <Badge variant="destructive">Rechazada</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <TrophyIcon className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{mission.title}</CardTitle>
              {userRole === 'parent' && mission.child && (
                <CardDescription className="text-xs">
                  Asignada a {mission.child.name}
                </CardDescription>
              )}
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mission.description && (
            <p className="text-sm text-muted-foreground">{mission.description}</p>
          )}
          
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-sm font-medium">Recompensa</span>
            <span className="text-lg font-bold text-amber-500">
              {formatCurrency(mission.reward)}
            </span>
          </div>

          {mission.reject_reason && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-xs font-medium text-destructive">Motivo de rechazo:</p>
              <p className="mt-1 text-sm text-destructive/90">{mission.reject_reason}</p>
            </div>
          )}

          {/* Child actions */}
          {userRole === 'child' && mission.status === 'activa' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" size="sm">
                  <CheckIcon className="h-4 w-4" />
                  Marcar como completada
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Completaste esta misión?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tu padre revisará la misión antes de aprobar la recompensa.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleComplete}
                    disabled={isCompleting}
                  >
                    {isCompleting ? 'Enviando...' : 'Enviar para revisión'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {userRole === 'child' && mission.status === 'en_revision' && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-3">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Esperando revisión del padre
              </span>
            </div>
          )}

          {/* Parent actions */}
          {userRole === 'parent' && mission.status === 'en_revision' && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="flex-1" size="sm" variant="default">
                    <CheckIcon className="h-4 w-4" />
                    Aprobar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Aprobar misión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se acreditarán {formatCurrency(mission.reward)} al saldo de {mission.child?.name}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleApprove}
                      disabled={isApproving}
                    >
                      {isApproving ? 'Aprobando...' : 'Aprobar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1" size="sm" variant="destructive">
                    <XIcon className="h-4 w-4" />
                    Rechazar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleReject}>
                    <DialogHeader>
                      <DialogTitle>Rechazar misión</DialogTitle>
                      <DialogDescription>
                        Explica por qué no se completó correctamente la misión
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="reject_reason">Motivo (opcional)</Label>
                        <Textarea
                          id="reject_reason"
                          value={data.reject_reason}
                          onChange={(e) => setData('reject_reason', e.target.value)}
                          placeholder="Ej: La habitación no quedó completamente limpia"
                          aria-invalid={!!errors.reject_reason}
                        />
                        {errors.reject_reason && (
                          <p className="text-sm text-destructive">{errors.reject_reason}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsRejectDialogOpen(false)}
                        disabled={processing}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" variant="destructive" disabled={processing}>
                        {processing ? 'Rechazando...' : 'Rechazar'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
