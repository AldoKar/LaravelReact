import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MissionCard, type Mission } from '@/components/missions';
import { PlusIcon, TrophyIcon } from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface Child {
  id: number;
  name: string;
}

interface MissionsIndexProps {
  missions: Mission[];
  userRole: 'parent' | 'child';
  children?: Child[];
}

export default function MissionsIndex({ missions, userRole, children }: MissionsIndexProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    child_id: '',
    title: '',
    description: '',
    reward: '',
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/missions', {
      onSuccess: () => {
        reset();
        setIsDialogOpen(false);
      },
    });
  };

  const activeMissions = missions.filter((m) => m.status === 'activa');
  const inReviewMissions = missions.filter((m) => m.status === 'en_revision');
  const completedMissions = missions.filter((m) => m.status === 'completada');
  const rejectedMissions = missions.filter((m) => m.status === 'rechazada');

  return (
    <>
      <Head title="Misiones" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Misiones</h1>
            <p className="text-sm text-muted-foreground">
              {userRole === 'parent'
                ? 'Crea misiones para incentivar buenos hábitos en tus hijos'
                : 'Completa misiones para ganar recompensas'}
            </p>
          </div>
          {userRole === 'parent' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon />
                  Crear misión
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Crear misión</DialogTitle>
                    <DialogDescription>
                      Define una tarea para tu hijo con una recompensa monetaria
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="child_id">Hijo</Label>
                      <Select
                        value={data.child_id}
                        onValueChange={(value) => setData('child_id', value)}
                      >
                        <SelectTrigger aria-invalid={!!errors.child_id}>
                          <SelectValue placeholder="Selecciona un hijo" />
                        </SelectTrigger>
                        <SelectContent>
                          {children?.map((child) => (
                            <SelectItem key={child.id} value={child.id.toString()}>
                              {child.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.child_id && (
                        <p className="text-sm text-destructive">{errors.child_id}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Ej: Limpiar tu habitación"
                        aria-invalid={!!errors.title}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive">{errors.title}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Describe los detalles de la misión"
                        aria-invalid={!!errors.description}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reward">Recompensa ($)</Label>
                      <Input
                        id="reward"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={data.reward}
                        onChange={(e) => setData('reward', e.target.value)}
                        placeholder="0.00"
                        aria-invalid={!!errors.reward}
                      />
                      {errors.reward && (
                        <p className="text-sm text-destructive">{errors.reward}</p>
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
                      {processing ? 'Creando...' : 'Crear misión'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-sidebar-border/70 p-12 dark:border-sidebar-border">
            <TrophyIcon className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              {userRole === 'parent'
                ? 'No hay misiones creadas'
                : 'No tienes misiones asignadas'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {userRole === 'parent'
                ? 'Crea una misión para incentivar buenos hábitos en tus hijos'
                : 'Tu padre aún no te ha asignado ninguna misión'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeMissions.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold">
                  {userRole === 'parent' ? 'Misiones activas' : 'Misiones disponibles'}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeMissions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} userRole={userRole} />
                  ))}
                </div>
              </div>
            )}

            {inReviewMissions.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold">En revisión</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inReviewMissions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} userRole={userRole} />
                  ))}
                </div>
              </div>
            )}

            {completedMissions.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold">Completadas</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedMissions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} userRole={userRole} />
                  ))}
                </div>
              </div>
            )}

            {rejectedMissions.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold">Rechazadas</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rejectedMissions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} userRole={userRole} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

MissionsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Misiones',
      href: '/missions',
    },
  ],
};
