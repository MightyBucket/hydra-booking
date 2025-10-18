import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNotesByStudent, useCreateNote, useUpdateNote, useDeleteNote } from './useNotes';
import { useDialogState } from './useDialogState';

export function useStudentNotes(studentId: string | null) {
  const { isOpen: showNotesDialog, open: openNotes, close: closeNotes } = useDialogState();
  const { isOpen: showNoteForm, data: editingNote, open: openNoteForm, close: closeNoteForm, setIsOpen: setShowNoteForm, setData: setEditingNote } = useDialogState<any>();
  const { toast } = useToast();

  const { data: notesData = [] } = useNotesByStudent(studentId || '');
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const handleOpenNotes = () => {
    openNotes();
  };

  const handleCloseNotes = () => {
    closeNotes();
    closeNoteForm();
  };

  const handleAddNote = () => {
    openNoteForm(null);
  };

  const handleEditNote = (note: any) => {
    openNoteForm(note);
  };

  const handleNoteSubmit = async (data: { title: string; content: string }) => {
    if (!studentId) return;

    try {
      if (editingNote) {
        await updateNoteMutation.mutateAsync({
          id: editingNote.id,
          studentId,
          title: data.title,
          content: data.content,
        });
        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      } else {
        await createNoteMutation.mutateAsync({
          studentId,
          title: data.title,
          content: data.content,
        });
        toast({
          title: "Success",
          description: "Note added successfully",
        });
      }
      setShowNoteForm(false);
      setEditingNote(null);
    } catch (error) {
      toast({
        title: "Error",
        description: editingNote ? "Failed to update note" : "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!studentId) return;

    try {
      await deleteNoteMutation.mutateAsync({ id: noteId, studentId });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  return {
    showNotesDialog,
    showNoteForm,
    editingNote,
    notesData,
    handleOpenNotes,
    handleCloseNotes,
    handleAddNote,
    handleEditNote,
    handleNoteSubmit,
    handleDeleteNote,
    setShowNoteForm,
    setEditingNote,
  };
}