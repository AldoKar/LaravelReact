import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, ClockIcon, SaveIcon } from 'lucide-react';
import { index as childrenIndex } from '@/routes/children';
import { FormEventHandler } from 'react';

interface Child {
  id: number;
  name: string;
  email: string;
  balance: number;
}

interface ScheduleRestriction {
  id: number;
  days: string[];
  start_time: string;
  end_time: string;
}

interface RestrictionsIndexProps {
  child: Child;
  scheduleRestriction: ScheduleRestriction | null;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

export default function RestrictionsIndex({ child, scheduleRestriction }: RestrictionsIndexProps) {
  const { data, setData, post, put, processing, errors } = useForm({
    days: scheduleRestriction?.days || [],
    start_time: scheduleRestriction?.start_time || '09:00',
    end_time: scheduleRestriction?.end_time || '18:00',
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    
    if (scheduleRestriction) {
      put(`/children/${child.id}/restrictions/schedule`);
    } else {
      post(`/children/${child.id}/restrictions/schedule`);
    }
  };

  const toggleDay = (day: string) => {
    const currentDays = [...data.days];
    const index = currentDays.indexOf(day);
    
    if (index > -1) {
      currentDays.splice(index, 1);
    } else {
      currentDays.push(day);
    }
    
    setData('days', currentDays);
  };

  return (
    <>
      <Head title={`Restricciones - ${child.name}`} />
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
              <h1 className="text-2xl font-semibold">Restricciones de {child.name}</h1>
              <p className="text-sm text-muted-foreground">
                Configura horarios y categorías permitidas
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Restricción de horario</CardTitle>
                  <CardDescription>
                    Define los días y horarios en que {child.name} puede registrar gastos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label>Días permitidos</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.value}
                          checked={data.days.includes(day.value)}
                          onCheckedChange={() => toggleDay(day.value)}
                        />
                        <Label
                          htmlFor={day.value}
                          className="cursor-pointer text-sm font-normal"
                        >
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.days && (
                    <p className="text-sm text-destructive">{errors.days}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Hora de inicio</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={data.start_time}
                      onChange={(e) => setData('start_time', e.target.value)}
                      aria-invalid={!!errors.start_time}
                    />
                    {errors.start_time && (
                      <p className="text-sm text-destructive">{errors.start_time}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">Hora de fin</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={data.end_time}
                      onChange={(e) => setData('end_time', e.target.value)}
                      aria-invalid={!!errors.end_time}
                    />
                    {errors.end_time && (
                      <p className="text-sm text-destructive">{errors.end_time}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    {data.days.length === 0 ? (
                      'Selecciona al menos un día para activar la restricción'
                    ) : (
                      <>
                        {child.name} podrá registrar gastos los{' '}
                        <span className="font-medium text-foreground">
                          {data.days
                            .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
                            .join(', ')}
                        </span>{' '}
                        entre las{' '}
                        <span className="font-medium text-foreground">{data.start_time}</span> y las{' '}
                        <span className="font-medium text-foreground">{data.end_time}</span>
                      </>
                    )}
                  </p>
                </div>

                <Button type="submit" disabled={processing || data.days.length === 0} className="w-full">
                  <SaveIcon className="h-4 w-4" />
                  {processing
                    ? 'Guardando...'
                    : scheduleRestriction
                      ? 'Actualizar restricción'
                      : 'Crear restricción'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
              <CardDescription>Cómo funcionan las restricciones de horario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Las restricciones de horario te permiten controlar cuándo {child.name} puede
                registrar gastos en la aplicación.
              </p>
              <p>
                Si {child.name} intenta registrar un gasto fuera del horario permitido, el sistema
                lo rechazará automáticamente.
              </p>
              <p>
                Puedes modificar los días y horarios en cualquier momento, y los cambios se
                aplicarán de inmediato.
              </p>
              {!scheduleRestriction && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                  <p className="text-amber-800 dark:text-amber-200">
                    Actualmente no hay restricciones de horario configuradas. {child.name} puede
                    registrar gastos en cualquier momento.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

RestrictionsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Cuentas Hijo',
      href: childrenIndex(),
    },
    {
      title: 'Restricciones',
    },
  ],
};
