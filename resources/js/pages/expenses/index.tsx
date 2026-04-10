import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ExpenseFormDialog, type Expense } from '@/components/expenses/ExpenseForm';
import { ExpenseCharts } from '@/components/expenses/ExpenseCharts';
import { index as expensesIndex } from '@/routes/expenses';
import { EditIcon, TrashIcon, FilterIcon, XIcon } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ExpensesIndexProps {
  expenses: Expense[];
}

export default function ExpensesIndex({ expenses }: ExpensesIndexProps) {
  const [deletingExpense, setDeletingExpense] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = (expenseId: number) => {
    router.delete(`/expenses/${expenseId}`, {
      onStart: () => setDeletingExpense(expenseId),
      onFinish: () => setDeletingExpense(null),
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

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(expenses.map((expense) => expense.category?.name).filter(Boolean)));
  }, [expenses]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Category filter
      if (categoryFilter !== 'all' && expense.category?.name !== categoryFilter) {
        return false;
      }

      // Date range filter
      if (startDate && expense.date < startDate) {
        return false;
      }
      if (endDate && expense.date > endDate) {
        return false;
      }

      return true;
    });
  }, [expenses, categoryFilter, startDate, endDate]);

  const clearFilters = () => {
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = categoryFilter !== 'all' || startDate !== '' || endDate !== '';

  return (
    <>
      <Head title="Gastos" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Gastos</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus gastos registrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                  {[categoryFilter !== 'all', startDate, endDate].filter(Boolean).length}
                </span>
              )}
            </Button>
            <ExpenseFormDialog />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category-filter">Categoría</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category-filter">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Fecha inicio</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">Fecha fin</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {filteredExpenses.length} de {expenses.length} gastos
                  </p>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <XIcon className="h-4 w-4" />
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-sidebar-border/70 p-12 dark:border-sidebar-border">
            <p className="text-lg font-medium text-muted-foreground">
              No hay gastos registrados
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Comienza registrando tu primer gasto
            </p>
            <div className="mt-6">
              <ExpenseFormDialog />
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-sidebar-border/70 p-12 dark:border-sidebar-border">
            <p className="text-lg font-medium text-muted-foreground">
              No hay gastos que coincidan con los filtros
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta ajustar los filtros para ver más resultados
            </p>
            <div className="mt-6">
              <Button variant="outline" onClick={clearFilters}>
                <XIcon className="h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        ) : (
          <ResizablePanelGroup
            className="min-h-[800px] rounded-xl border border-sidebar-border/70 dark:border-sidebar-border"
          >
            {/* ─── Charts Panel ──────────────────────────────────── */}
            <ResizablePanel defaultSize={50} minSize={25}>
              <div className="h-full overflow-y-auto p-4">
                <ExpenseCharts expenses={filteredExpenses} />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* ─── Table Panel ───────────────────────────────────── */}
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="h-full overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {formatDate(expense.date)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {expense.category?.name ?? 'Sin categoría'}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {expense.description || '—'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <ExpenseFormDialog
                              expense={expense}
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <EditIcon className="h-4 w-4" />
                                  <span className="sr-only">Editar gasto</span>
                                </Button>
                              }
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <TrashIcon className="h-4 w-4" />
                                  <span className="sr-only">Eliminar gasto</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ¿Eliminar gasto?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. El gasto será
                                    eliminado permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(expense.id)}
                                    disabled={deletingExpense === expense.id}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {deletingExpense === expense.id
                                      ? 'Eliminando...'
                                      : 'Eliminar'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </>
  );
}

ExpensesIndex.layout = {
  breadcrumbs: [
    {
      title: 'Gastos',
      href: expensesIndex(),
    },
  ],
};
