import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, ClockIcon, SaveIcon, ShieldBanIcon, TrashIcon } from 'lucide-react';
import { index as childrenIndex } from '@/routes/children';
import { FormEventHandler, useState } from 'react';
import { router } from '@inertiajs/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

interface Category {
  id: number;
  name: string;
}

interface CategoryRestriction {
  id: number;
  category: Category;
  type: 'blocked' | 'limited';
  monthly_limit: number | null;
}

interface RestrictionsIndexProps {
  child: Child;
  scheduleRestriction: ScheduleRestriction | null;
  categoryRestrictions: CategoryRestriction[];
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

export default function RestrictionsIndex({ child, scheduleRestriction, categoryRestrictions }: RestrictionsIndexProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const { data, setData, post, put, processing, errors } = useForm({
    days: scheduleRestriction?.days || [],
    start_time: scheduleRestriction?.start_time || '09:00',
    end_time: scheduleRestriction?.end_time || '18:00',
  });

  const categoryForm = useForm({
    category_id: '',
    type: 'blocked' as 'blocked' | 'limited',
    monthly_limit: '',
  });

  // Fetch categories on mount
  useState(() => {
    fetch('/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch(console.error);
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

  const handleCategorySubmit: FormEventHandler = (e) => {
    e.preventDefault();
    categoryForm.post(`/children/${child.id}/restrictions/category`, {
      onSuccess: () => {
        categoryForm.reset();
        setShowCategoryForm(false);
      },
    });
  };

  const handleDeleteRestriction = (restrictionId: number) => {
    if (confirm('¿Estás seguro de eliminar esta restricción?')) {
      router.delete(`/children/${child.id}/restrictions/category/${restrictionId}`);
    }
  };

  const availableCategories = categories.filter(
    (cat) => !categoryRestrictions.some((r) => r.category.id === cat.id)
  );

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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldBanIcon className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Restricciones de categoría</CardTitle>
                    <CardDescription>
                      Bloquea o limita gastos en categorías específicas
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryRestrictions.length > 0 && (
                <div className="space-y-2">
                  {categoryRestrictions.map((restriction) => (
                    <div
                      key={restriction.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{restriction.category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {restriction.type === 'blocked'
                            ? 'Bloqueada'
                            : `Límite: $${restriction.monthly_limit}/mes`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRestriction(restriction.id)}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!showCategoryForm && availableCategories.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCategoryForm(true)}
                >
                  Agregar restricción
                </Button>
              )}

              {showCategoryForm && (
                <form onSubmit={handleCategorySubmit} className="space-y-4 rounded-lg border p-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Categoría</Label>
                    <Select
                      value={categoryForm.data.category_id}
                      onValueChange={(value) => categoryForm.setData('category_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {categoryForm.errors.category_id && (
                      <p className="text-sm text-destructive">{categoryForm.errors.category_id}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Tipo de restricción</Label>
                    <RadioGroup
                      value={categoryForm.data.type}
                      onValueChange={(value: 'blocked' | 'limited') =>
                        categoryForm.setData('type', value)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="blocked" id="blocked" />
                        <Label htmlFor="blocked" className="font-normal">
                          Bloquear completamente
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="limited" id="limited" />
                        <Label htmlFor="limited" className="font-normal">
                          Establecer límite mensual
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {categoryForm.data.type === 'limited' && (
                    <div className="space-y-2">
                      <Label htmlFor="monthly_limit">Límite mensual ($)</Label>
                      <Input
                        id="monthly_limit"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={categoryForm.data.monthly_limit}
                        onChange={(e) => categoryForm.setData('monthly_limit', e.target.value)}
                        placeholder="0.00"
                      />
                      {categoryForm.errors.monthly_limit && (
                        <p className="text-sm text-destructive">
                          {categoryForm.errors.monthly_limit}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowCategoryForm(false);
                        categoryForm.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={categoryForm.processing || !categoryForm.data.category_id}
                    >
                      {categoryForm.processing ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                </form>
              )}

              {availableCategories.length === 0 && !showCategoryForm && (
                <p className="text-center text-sm text-muted-foreground">
                  Todas las categorías tienen restricciones configuradas
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
            <CardDescription>Cómo funcionan las restricciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Restricciones de horario</p>
              <p>
                Las restricciones de horario te permiten controlar cuándo {child.name} puede
                registrar gastos en la aplicación.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Restricciones de categoría</p>
              <p>
                Puedes bloquear completamente una categoría o establecer un límite mensual de gasto.
                Si {child.name} intenta exceder el límite, el sistema rechazará el gasto.
              </p>
            </div>
            {!scheduleRestriction && categoryRestrictions.length === 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-amber-800 dark:text-amber-200">
                  Actualmente no hay restricciones configuradas. {child.name} puede registrar gastos
                  en cualquier momento y categoría.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
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
