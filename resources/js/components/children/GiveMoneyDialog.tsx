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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import children from '@/routes/children';
import { CircleDollarSign } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface GiveMoneyDialogProps {
  child: {
    id: number;
    name: string;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function GiveMoneyDialog({ child, trigger, onSuccess }: GiveMoneyDialogProps) {
  const [open, setOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    amount: '',
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    if (!newOpen) {
      reset();
    }
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(children.giveMoney.url(child.id), {
      onSuccess: () => {
        reset();
        setOpen(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <CircleDollarSign />
            Dar dinero
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dar dinero a {child.name}</DialogTitle>
          <DialogDescription>
            Este movimiento se registrará como un gasto familiar en tu cuenta principal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="give-money-amount">Monto</FieldLabel>
              <Input
                id="give-money-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={data.amount}
                onChange={(event) => setData('amount', event.target.value)}
                aria-invalid={!!errors.amount}
                required
              />
              <FieldError errors={[{ message: errors.amount }]} />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Enviando...' : 'Dar dinero'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}