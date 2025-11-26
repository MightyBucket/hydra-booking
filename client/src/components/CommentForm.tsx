
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X, Plus } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CommentFormProps {
  onSubmit: (data: { title: string; content: string; visibleToStudent: boolean; tagIds: string[] }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    content: string;
    visibleToStudent: boolean;
    tagIds?: string[];
  };
  isEditing?: boolean;
}

export default function CommentForm({ onSubmit, onCancel, initialData, isEditing = false }: CommentFormProps) {
  const { data: tags = [] } = useTags();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    visibleToStudent: initialData?.visibleToStudent || false,
    tagIds: initialData?.tagIds || [] as string[],
  });
  const [showTagPicker, setShowTagPicker] = useState(false);

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

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }));
  };

  const selectedTags = tags.filter((tag: any) => formData.tagIds.includes(tag.id));

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

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag: any) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer"
              style={{ borderColor: tag.color, color: tag.color }}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          <Popover open={showTagPicker} onOpenChange={setShowTagPicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" type="button">
                <Plus className="h-4 w-4 mr-1" />
                Add Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <p className="text-sm font-medium">Select tags</p>
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags available. Create tags in Settings.</p>
                ) : (
                  <div className="space-y-1">
                    {tags.map((tag: any) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                        onClick={() => {
                          toggleTag(tag.id);
                          setShowTagPicker(false);
                        }}
                      >
                        <Checkbox
                          checked={formData.tagIds.includes(tag.id)}
                          onCheckedChange={() => toggleTag(tag.id)}
                        />
                        <Badge
                          variant="outline"
                          style={{ borderColor: tag.color, color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
