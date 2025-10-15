
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (data: { title: string; content: string; visibleToStudent: boolean }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    content: string;
    visibleToStudent: boolean;
  };
  isEditing?: boolean;
}

export default function CommentForm({ onSubmit, onCancel, initialData, isEditing = false }: CommentFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    visibleToStudent: initialData?.visibleToStudent || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="comment-form">
      <div className="space-y-2">
        <Label htmlFor="comment-title">Title</Label>
        <Input
          id="comment-title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter title"
          required
          data-testid="input-comment-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment-content">Comment</Label>
        <Textarea
          id="comment-content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Enter your comment"
          rows={4}
          required
          data-testid="input-comment-content"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="visible-to-student"
          checked={formData.visibleToStudent}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, visibleToStudent: !!checked }))
          }
          data-testid="checkbox-visible-to-student"
        />
        <Label htmlFor="visible-to-student" className="text-sm">
          Visible to student
        </Label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel-comment"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          data-testid="button-save-comment"
        >
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update Comment' : 'Add Comment'}
        </Button>
      </div>
    </form>
  );
}
