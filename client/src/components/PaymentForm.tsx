
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  students: any[];
  parents: any[];
  lessons: any[];
  onSubmit: (data: {
    payerType: 'student' | 'parent';
    payerId: string;
    amount: string;
    paymentDate: Date;
    notes: string;
    lessonIds: string[];
  }) => void;
  onCancel: () => void;
}

export default function PaymentForm({
  students,
  parents,
  lessons,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    payerType: '' as 'student' | 'parent' | '',
    payerId: '',
    amount: '',
    paymentDate: new Date(),
    notes: '',
  });
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<any[]>([]);

  // Filter lessons based on selected payer
  useEffect(() => {
    if (!formData.payerType || !formData.payerId) {
      setFilteredLessons([]);
      setSelectedLessonIds([]);
      return;
    }

    let filtered: any[] = [];
    
    if (formData.payerType === 'student') {
      // Show lessons for the selected student
      filtered = lessons.filter(lesson => lesson.studentId === formData.payerId);
    } else if (formData.payerType === 'parent') {
      // Show lessons for all students belonging to this parent
      const parentStudents = students.filter(s => s.parentId === formData.payerId);
      const studentIds = parentStudents.map(s => s.id);
      filtered = lessons.filter(lesson => studentIds.includes(lesson.studentId));
    }

    setFilteredLessons(filtered);
    setSelectedLessonIds([]);
  }, [formData.payerType, formData.payerId, students, parents, lessons]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.payerType || !formData.payerId || !formData.amount) {
      return;
    }

    onSubmit({
      payerType: formData.payerType,
      payerId: formData.payerId,
      amount: formData.amount,
      paymentDate: formData.paymentDate,
      notes: formData.notes,
      lessonIds: selectedLessonIds,
    });
  };

  const toggleLesson = (lessonId: string) => {
    setSelectedLessonIds(prev => 
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const allPayers = [
    ...students.map(s => ({
      id: s.id,
      type: 'student' as const,
      name: `${s.firstName} ${s.lastName || ''}`,
    })),
    ...parents.map(p => ({
      id: p.id,
      type: 'parent' as const,
      name: p.name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="payer">Payer *</Label>
        <Select
          value={formData.payerId}
          onValueChange={(value) => {
            const payer = allPayers.find(p => p.id === value);
            if (payer) {
              setFormData(prev => ({
                ...prev,
                payerId: value,
                payerType: payer.type,
              }));
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payer" />
          </SelectTrigger>
          <SelectContent>
            {students.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  Students
                </div>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName || ''}
                  </SelectItem>
                ))}
              </>
            )}
            {parents.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  Parents
                </div>
                {parents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (£) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, amount: e.target.value }))
          }
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Payment Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.paymentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.paymentDate ? (
                format(formData.paymentDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.paymentDate}
              onSelect={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentDate: date || new Date(),
                }))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {filteredLessons.length > 0 && (
        <div className="space-y-2">
          <Label>Lessons Paid For</Label>
          <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
            {filteredLessons.map((lesson) => {
              const student = students.find(s => s.id === lesson.studentId);
              return (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => toggleLesson(lesson.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedLessonIds.includes(lesson.id)}
                    onChange={() => toggleLesson(lesson.id)}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">
                      {format(new Date(lesson.dateTime), 'MMM d, yyyy')} - {lesson.subject}
                    </div>
                    {student && (
                      <div className="text-muted-foreground text-xs">
                        {student.firstName} {student.lastName || ''}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    £{parseFloat(lesson.pricePerHour).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedLessonIds.length} lesson(s) selected
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Add any notes about this payment"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Payment</Button>
      </div>
    </form>
  );
}
