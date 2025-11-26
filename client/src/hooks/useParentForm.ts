
import { useToast } from '@/hooks/use-toast';
import { useCreateParent, useUpdateParent } from './useParents';
import { useDialogState } from './useDialogState';

export function useParentForm() {
  const { isOpen: showParentForm, data: selectedParent, open, close } = useDialogState<any>();
  const { toast } = useToast();
  const createParentMutation = useCreateParent();
  const updateParentMutation = useUpdateParent();

  const handleOpenForm = (parent?: any) => {
    open(parent || null);
  };

  const handleCloseForm = () => {
    close();
  };

  const handleSubmit = async (parentData: any) => {
    try {
      if (selectedParent) {
        await updateParentMutation.mutateAsync({
          id: selectedParent.id,
          ...parentData,
        });
        toast({
          title: "Success",
          description: "Parent updated successfully",
        });
      } else {
        await createParentMutation.mutateAsync(parentData);
        toast({ title: "Success", description: "Parent added successfully" });
      }

      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save parent",
        variant: "destructive",
      });
    }
  };

  return {
    showParentForm,
    selectedParent,
    handleOpenForm,
    handleCloseForm,
    handleSubmit,
  };
}
