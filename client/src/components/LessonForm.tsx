import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, Clock, Save, X, ChevronDown } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName?: string | null;
  defaultSubject?: string;
  defaultRate?: string | null;
  defaultLink?: string | null;
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
    paymentStatus?: 'pending' | 'paid' | 'unpaid' | 'free' | 'cancelled';
  };
  onSubmit: (lessonData: any) => void;
  onCancel: () => void;
}

export default function LessonForm({ students, initialData, onSubmit, onCancel }: LessonFormProps) {
  const getDefaultDateTime = () => {
    const now = new Date();
    // Set to next hour
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  };

  const toLocalISOString = (date: Date) => 
    new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    subject: initialData?.subject || '',
    dateTime: initialData?.dateTime 
      ? toLocalISOString(initialData.dateTime)
      : toLocalISOString(getDefaultDateTime()),
    studentId: initialData?.studentId || '',
    duration: initialData?.duration || 60,
    pricePerHour: initialData?.pricePerHour || 50,
    lessonLink: initialData?.lessonLink || '',
    paymentStatus: (initialData?.paymentStatus || 'pending') as 'pending' | 'paid' | 'unpaid' | 'free' | 'cancelled',
    isRecurring: false,
    frequency: 'weekly' as 'weekly' | 'biweekly',
    endDate: '',
  });

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId,
        subject: student.defaultSubject || prev.subject,
        pricePerHour: student.defaultRate ? parseFloat(student.defaultRate) : prev.pricePerHour,
        lessonLink: student.defaultLink || prev.lessonLink,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.dateTime) {
      alert('Please select a date and time for the lesson.');
      return;
    }

    if (!formData.studentId) {
      alert('Please select a student.');
      return;
    }

    if (!formData.subject) {
      alert('Please enter a subject.');
      return;
    }

    // Validate recurring fields if recurring is enabled
    if (formData.isRecurring && !formData.endDate) {
      alert('Please select an end date for recurring lessons.');
      return;
    }

    const lessonData = {
      ...formData,
      dateTime: new Date(formData.dateTime),
      pricePerHour: Number(formData.pricePerHour),
      duration: Number(formData.duration),
    };
    onSubmit(lessonData);
  };

  return (
    <Card className="w-full max-w-2xl" data-testid="lesson-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {initialData && (initialData as any).id ? 'Edit Lesson' : 'Schedule New Lesson'}
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
                step="300"
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
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value, 10) }))}
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
              <Label htmlFor="pricePerHour">Price per Hour (£)</Label>
              <Input
                id="pricePerHour"
                type="number"
                step="0.01"
                min="0"
                value={formData.pricePerHour}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) || 0 }))}
                required
                data-testid="input-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total Cost</Label>
              <Input
                id="total"
                value={`£${((formData.pricePerHour * formData.duration) / 60).toFixed(2)}`}
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

          {/* Payment Status Section - Only show when editing an existing lesson */}
          {initialData && (initialData as any).id && (
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select 
                value={formData.paymentStatus} 
                onValueChange={(value: 'pending' | 'paid' | 'unpaid' | 'free' | 'cancelled') => 
                  setFormData(prev => ({ ...prev, paymentStatus: value }))
                }
              >
                <SelectTrigger data-testid="select-payment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Recurring Lesson Section - Only show when creating new lessons */}
          {(!initialData || (!initialData.subject && !initialData.studentId)) && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="make-recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isRecurring: !!checked }))
                }
                data-testid="checkbox-make-recurring"
              />
              <Label htmlFor="make-recurring" className="text-sm font-medium">
                Make recurring
              </Label>
            </div>

            <Collapsible open={formData.isRecurring}>
              <CollapsibleContent className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select 
                        value={formData.frequency} 
                        onValueChange={(value: 'weekly' | 'biweekly') => 
                          setFormData(prev => ({ ...prev, frequency: value }))
                        }
                      >
                        <SelectTrigger data-testid="select-frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Every week</SelectItem>
                          <SelectItem value="biweekly">Every other week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        min={formData.dateTime ? formData.dateTime.split('T')[0] : undefined}
                        required={formData.isRecurring}
                        data-testid="input-end-date"
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Recurring lessons will be created automatically based on the selected frequency until the end date.</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          )}

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
              {initialData && (initialData as any).id ? 'Update Lesson' : 'Schedule Lesson'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}