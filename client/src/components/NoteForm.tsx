
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

interface NoteFormProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
  };
  onSubmit: (data: { title: string; content: string }) => void;
  onCancel: () => void;
}

export default function NoteForm({ initialData, onSubmit, onCancel }: NoteFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('Please enter note content');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="note-form">
      <div className="space-y-2">
        <Label htmlFor="note-title">Title</Label>
        <Input
          id="note-title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter title"
          required
          data-testid="input-note-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note-content">Note</Label>
        <Textarea
          id="note-content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Enter your note"
          rows={4}
          required
          data-testid="input-note-content"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel-note"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          data-testid="button-save-note"
        >
          <Save className="h-4 w-4 mr-2" />
          {initialData?.id ? 'Update Note' : 'Add Note'}
        </Button>
      </div>
    </form>
  );
}
