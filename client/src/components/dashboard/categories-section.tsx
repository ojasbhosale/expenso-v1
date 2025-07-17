import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CategoryModal } from "@/components/modals/category-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2 } from "lucide-react";

export function CategoriesSection() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  interface Category {
    id: number;
    name: string;
    color: string;
    icon: string;
    expenseCount: number;
    totalAmount: number;
  }


  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Category deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error deleting category",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this category? All expenses in this category will become uncategorized.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const getIconForCategory = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      "utensils": "🍽️",
      "car": "🚗",
      "shopping-bag": "🛍️",
      "film": "🎬",
      "receipt": "📄",
      "heart-pulse": "💊",
    };
    return iconMap[iconName] || "📁";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Categories</h3>
          <p className="text-gray-600">Manage your expense categories</p>
        </div>
        <Button 
          onClick={() => {
            setEditingCategory(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No categories found</p>
          <p className="text-gray-400 text-sm mt-1">Create your first category to organize your expenses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category: any) => (
            <div key={category.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <span className="text-lg">
                      {getIconForCategory(category.icon)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-500">{category.expenseCount} expenses</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                    className="h-8 w-8 text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    disabled={deleteCategoryMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">${category.totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Total spent</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
      />
    </div>
  );
}
