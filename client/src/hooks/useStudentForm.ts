import { useToast } from '@/hooks/use-toast';
import { useCreateStudent, useUpdateStudent } from './useStudents';
import { useDialogState } from './useDialogState';

export function useStudentForm() {
  const { isOpen: showStudentForm, data: selectedStudent, open, close } = useDialogState<any>();
  const { toast } = useToast();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();

  const handleOpenForm = (student?: any) => {
    open(student || null);
  };

  const handleCloseForm = () => {
    close();
  };

  const handleSubmit = async (studentData: any) => {
    try {
      const formattedData = {
        ...studentData,
        defaultRate: studentData.defaultRate
          ? studentData.defaultRate.toString()
          : null,
      };

      if (selectedStudent) {
        await updateStudentMutation.mutateAsync({
          id: selectedStudent.id,
          ...formattedData,
        });
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        await createStudentMutation.mutateAsync(formattedData);
        toast({ title: "Success", description: "Student added successfully" });
      }

      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save student",
        variant: "destructive",
      });
    }
  };

  return {
    showStudentForm,
    selectedStudent,
    handleOpenForm,
    handleCloseForm,
    handleSubmit,
  };
}