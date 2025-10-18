
import { useState } from 'react';
import { useCreateStudent, useUpdateStudent } from './useStudents';
import { useToast } from './use-toast';

export function useStudentForm() {
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const { toast } = useToast();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();

  const handleOpenForm = (student?: any) => {
    setSelectedStudent(student || null);
    setShowStudentForm(true);
  };

  const handleCloseForm = () => {
    setShowStudentForm(false);
    setSelectedStudent(null);
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
