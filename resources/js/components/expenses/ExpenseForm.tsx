import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormEventHandler, useEffect, useState } from 'react';
import { PlusIcon } from 'lucide-react';

export interface Category {
  id: number;
  name: string;
  icon: string | null;
}

export interface Expense {
  id: number;
  amount: string;
  category_id: number | null;
  category: Category | null;
  description: string | null;
  date: string;
}

interface ExpenseFormDialogProps {
  expense?: Expense;
  trigger?: React.ReactNode;
}

export function ExpenseFormDialog({ expense, trigger }: ExpenseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const isEditing = !!expense;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    amount: expense?.amount || '',
    category_id: expense?.category_id || '',
    description: expense?.description || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      if (categories.length > 0) {
        return;
      }

      setLoadingCategories(true);

      try {
        const response = await fetch('/categories', {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('No se pudieron cargar las categorías.');
        }

        const payload = await response.json();
        setCategories(payload.categories ?? []);
      } catch {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (open) {
      void loadCategories();
    }

    return () => controller.abort();
  }, [open, categories.length]);

  // Update form data when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    if (newOpen) {
      if (expense) {
        // Editing: populate with expense data
        setData({
          amount: expense.amount,
          category_id: expense.category_id ?? '',
          description: expense.description || '',
          date: expense.date,
        });
      } else {
        // Creating: reset to defaults
        reset();
      }
    }
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    if (isEditing) {
      put(`/expenses/${expense.id}`, {
        onSuccess: () => {
          setOpen(false);
        },
      });
    } else {
      post('/expenses', {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusIcon />
            Registrar gasto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar gasto' : 'Registrar nuevo gasto'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los detalles del gasto'
              : 'Completa los datos para registrar un nuevo gasto'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="amount">Monto</FieldLabel>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                aria-invalid={!!errors.amount}
                required
              />
              <FieldError errors={[{ message: errors.amount }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Categoría</FieldLabel>
              <Select
                value={data.category_id.toString()}
                onValueChange={(value) => setData('category_id', Number(value))}
                required
              >
                <SelectTrigger
                  id="category"
                  className="w-full"
                  aria-invalid={!!errors.category_id}
                >
                  <SelectValue placeholder={loadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[{ message: errors.category_id }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">
                Descripción (opcional)
              </FieldLabel>
              <Input
                id="description"
                type="text"
                placeholder="Ej: Almuerzo en restaurante"
                maxLength={255}
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                aria-invalid={!!errors.description}
              />
              <FieldError errors={[{ message: errors.description }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="date">Fecha</FieldLabel>
              <Input
                id="date"
                type="date"
                value={data.date}
                onChange={(e) => setData('date', e.target.value)}
                aria-invalid={!!errors.date}
                required
              />
              <FieldError errors={[{ message: errors.date }]} />
            </Field>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={processing}>
                {processing
                  ? 'Guardando...'
                  : isEditing
                    ? 'Actualizar'
                    : 'Registrar'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
