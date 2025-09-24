import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Save, X } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  defaultSubject?: string;
  defaultRate?: number;
}

interface LessonFormProps {
  students: Student[];
  initialData?: {
    subject?: string;
    dateTime?: Date;
    studentId?: string;
    duration?: number;
    pricePerHour?: number;
    lessonLink?: string;
  };
  onSubmit: (lessonData: any) => void;
  onCancel: () => void;
}

export default function LessonForm({ students, initialData, onSubmit, onCancel }: LessonFormProps) {
  const [formData, setFormData] = useState({
    subject: initialData?.subject || '',
    dateTime: initialData?.dateTime ? 
      new Date(initialData.dateTime.getTime() - (initialData.dateTime.getTimezoneOffset() * 60000))
        .toISOString().slice(0, 16) : '',
    studentId: initialData?.studentId || '',
    duration: initialData?.duration || 60,
    pricePerHour: initialData?.pricePerHour || 50,
    lessonLink: initialData?.lessonLink || '',
    paymentStatus: 'pending' as const,
  });

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId,
        subject: prev.subject || student.defaultSubject || '',
        pricePerHour: prev.pricePerHour === 50 ? (student.defaultRate || 50) : prev.pricePerHour,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lessonData = {
      ...formData,
      dateTime: new Date(formData.dateTime),
    };
    onSubmit(lessonData);
  };

  return (
    <Card className="w-full max-w-2xl" data-testid="lesson-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {initialData ? 'Edit Lesson' : 'Schedule New Lesson'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select 
                value={formData.studentId} 
                onValueChange={handleStudentChange}
                required
              >
                <SelectTrigger data-testid="select-student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem 
                      key={student.id} 
                      value={student.id}
                      data-testid={`student-option-${student.id}`}
                    >
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Mathematics, Physics"
                required
                data-testid="input-subject"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateTime">Date & Time</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dateTime: e.target.value }))}
                required
                data-testid="input-datetime"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select 
                value={formData.duration.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
              >
                <SelectTrigger data-testid="select-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerHour">Price per Hour ($)</Label>
              <Input
                id="pricePerHour"
                type="number"
                step="0.01"
                min="0"
                value={formData.pricePerHour}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) }))}
                required
                data-testid="input-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total Cost</Label>
              <Input
                id="total"
                value={`$${((formData.pricePerHour * formData.duration) / 60).toFixed(2)}`}
                disabled
                className="bg-muted"
                data-testid="text-total-cost"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonLink">Lesson Link (optional)</Label>
            <Input
              id="lessonLink"
              type="url"
              value={formData.lessonLink}
              onChange={(e) => setFormData(prev => ({ ...prev, lessonLink: e.target.value }))}
              placeholder="https://zoom.us/j/123456789"
              data-testid="input-lesson-link"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="button-save-lesson"
            >
              <Save className="h-4 w-4 mr-2" />
              {initialData ? 'Update Lesson' : 'Schedule Lesson'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}