import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
});

type CategoryForm = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: any;
}

const icons = [
  { name: "utensils", emoji: "🍽️" },
  { name: "car", emoji: "🚗" },
  { name: "shopping-bag", emoji: "🛍️" },
  { name: "film", emoji: "🎬" },
  { name: "receipt", emoji: "📄" },
  { name: "heart-pulse", emoji: "💊" },
  { name: "home", emoji: "🏠" },
  { name: "plane", emoji: "✈️" },
];

const colors = [
  "#EF4444", "#3B82F6", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#6366F1", "#F97316"
];

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIcon, setSelectedIcon] = useState("utensils");
  const [selectedColor, setSelectedColor] = useState("#EF4444");

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "utensils",
      color: "#EF4444",
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category created successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/categories/${category.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category updated successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
      setSelectedIcon(category.icon);
      setSelectedColor(category.color);
    } else {
      form.reset({
        name: "",
        icon: "utensils",
        color: "#EF4444",
      });
      setSelectedIcon("utensils");
      setSelectedColor("#EF4444");
    }
  }, [category, form]);

  const onSubmit = (data: CategoryForm) => {
    const categoryData = {
      name: data.name,
      icon: selectedIcon,
      color: selectedColor,
    };

    if (category) {
      updateCategoryMutation.mutate(categoryData);
    } else {
      createCategoryMutation.mutate(categoryData);
    }
  };

  const isPending = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name*</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g., Travel"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          
          <div>
            <Label>Icon</Label>
            <div className="grid grid-cols-6 gap-2 p-3 border border-gray-300 rounded-lg">
              {icons.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    selectedIcon === icon.name
                      ? "bg-primary text-white"
                      : "bg-gray-100 hover:bg-primary/10"
                  }`}
                  onClick={() => {
                    setSelectedIcon(icon.name);
                    form.setValue("icon", icon.name);
                  }}
                >
                  <span className="text-lg">{icon.emoji}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-gray-600"
                      : "ring-2 ring-transparent hover:ring-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedColor(color);
                    form.setValue("color", color);
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : (category ? "Update Category" : "Add Category")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
