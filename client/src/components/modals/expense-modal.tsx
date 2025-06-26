import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: any;
}

export function ExpenseModal({ isOpen, onClose, expense }: ExpenseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: "",
      categoryId: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Expense created successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/expenses/${expense.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Expense updated successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        title: expense.title,
        amount: expense.amount,
        categoryId: expense.categoryId?.toString() || "",
        date: expense.date,
        description: expense.description || "",
      });
    } else {
      form.reset({
        title: "",
        amount: "",
        categoryId: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
      });
    }
  }, [expense, form]);

  const onSubmit = (data: ExpenseForm) => {
    const expenseData = {
      title: data.title,
      amount: parseFloat(data.amount),
      categoryId: parseInt(data.categoryId),
      date: data.date,
      description: data.description || null,
    };

    if (expense) {
      updateExpenseMutation.mutate(expenseData);
    } else {
      createExpenseMutation.mutate(expenseData);
    }
  };

  const isPending = createExpenseMutation.isPending || updateExpenseMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{expense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g., Lunch at cafe"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="amount">Amount*</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="amount"
                {...form.register("amount")}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="categoryId">Category*</Label>
            <Select 
              value={form.watch("categoryId")} 
              onValueChange={(value) => form.setValue("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="date">Date*</Label>
            <Input
              id="date"
              type="date"
              {...form.register("date")}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : (expense ? "Update Expense" : "Add Expense")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
