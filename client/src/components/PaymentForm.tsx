
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
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { CalendarIcon, Calendar as CalendarViewIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  initialData?: any;
}

export default function PaymentForm({
  students,
  parents,
  lessons,
  onSubmit,
  onCancel,
  initialData,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    payerType: (initialData?.payerType || '') as 'student' | 'parent' | '',
    payerId: initialData?.payerId || '',
    amount: initialData?.amount || '',
    paymentDate: initialData?.paymentDate ? new Date(initialData.paymentDate) : new Date(),
    notes: initialData?.notes || '',
  });
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<any[]>([]);
  const [showPaidLessons, setShowPaidLessons] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [hasChangedPaymentDate, setHasChangedPaymentDate] = useState(!!initialData?.paymentDate);

  // Load existing lesson IDs if editing
  useEffect(() => {
    if (initialData?.id) {
      // Fetch the lesson IDs for this payment
      fetch(`/api/payments/${initialData.id}/lessons`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
        },
      })
        .then(res => res.json())
        .then(lessonIds => setSelectedLessonIds(lessonIds))
        .catch(err => console.error('Error loading payment lessons:', err));
    }
  }, [initialData?.id]);

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

    // Filter lessons based on payment status
    filtered = filtered.filter(lesson => {
      if (showPaidLessons) {
        // Show all lessons
        return true;
      } else {
        // Show only pending lessons
        return lesson.paymentStatus === 'pending';
      }
    });

    // Sort by date ascending
    filtered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    setFilteredLessons(filtered);
    setSelectedLessonIds([]);
  }, [formData.payerType, formData.payerId, students, parents, lessons, showPaidLessons]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.payerType || !formData.payerId || !formData.amount) {
      return;
    }

    const submitData: any = {
      payerType: formData.payerType,
      payerId: formData.payerId,
      amount: formData.amount,
      paymentDate: formData.paymentDate,
      notes: formData.notes,
      lessonIds: selectedLessonIds,
    };

    // Include the payment ID if we're editing
    if (initialData?.id) {
      submitData.id = initialData.id;
    }

    onSubmit(submitData);
  };

  const toggleLesson = (lessonId: string) => {
    setSelectedLessonIds(prev => {
      const newIds = prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId];
      
      // Calculate total amount for selected lessons
      const total = newIds.reduce((sum, id) => {
        const lesson = filteredLessons.find(l => l.id === id);
        if (lesson) {
          const lessonPrice = (parseFloat(lesson.pricePerHour) * lesson.duration) / 60;
          return sum + lessonPrice;
        }
        return sum;
      }, 0);
      
      // If this is the first lesson being selected and payment date hasn't been changed
      if (newIds.length === 1 && !hasChangedPaymentDate) {
        const firstLesson = filteredLessons.find(l => l.id === newIds[0]);
        if (firstLesson) {
          setFormData(prev => ({ 
            ...prev, 
            amount: total.toFixed(2),
            paymentDate: new Date(firstLesson.dateTime)
          }));
          return newIds;
        }
      }
      
      // Update the amount field
      setFormData(prev => ({ ...prev, amount: total.toFixed(2) }));
      
      return newIds;
    });
  };

  const autoSelectLessonsByAmount = () => {
    const targetAmount = parseFloat(formData.amount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      return;
    }

    // Filter to only unpaid lessons
    const unpaidLessons = filteredLessons.filter(l => l.paymentStatus === 'pending');
    
    // Sort by date descending (most recent first)
    const sortedLessons = [...unpaidLessons].sort((a, b) => 
      new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

    let runningTotal = 0;
    const selectedIds: string[] = [];

    // Select lessons until we reach or exceed the target amount
    for (const lesson of sortedLessons) {
      const lessonPrice = (parseFloat(lesson.pricePerHour) * lesson.duration) / 60;
      
      if (runningTotal + lessonPrice <= targetAmount + 0.01) { // Allow small rounding difference
        selectedIds.push(lesson.id);
        runningTotal += lessonPrice;
      }

      // Stop if we've matched the amount
      if (Math.abs(runningTotal - targetAmount) < 0.01) {
        break;
      }
    }

    setSelectedLessonIds(selectedIds);
  };

  const getLessonsForDate = (date: Date) => {
    return filteredLessons
      .filter((lesson) => isSameDay(new Date(lesson.dateTime), date))
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  };

  const monthStart = startOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(calendarStart, index));

  const handleCalendarDateClick = (date: Date) => {
    setSelectedCalendarDate(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
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
              onSelect={(date) => {
                setFormData((prev) => ({
                  ...prev,
                  paymentDate: date || new Date(),
                }));
                setHasChangedPaymentDate(true);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {filteredLessons.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Lessons Paid For</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={autoSelectLessonsByAmount}
                disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                className="h-8 text-xs"
              >
                Auto-select by amount
              </Button>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-paid-lessons"
                  checked={showPaidLessons}
                  onChange={(e) => setShowPaidLessons(e.target.checked)}
                  className="h-4 w-4 cursor-pointer"
                />
                <Label htmlFor="show-paid-lessons" className="cursor-pointer text-sm font-normal">
                  Show paid lessons
                </Label>
              </div>
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarViewIcon className="h-4 w-4 mr-2" />
                Calendar View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-2">
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {filteredLessons.map((lesson) => {
                  const student = students.find(s => s.id === lesson.studentId);
                  const totalPrice = (parseFloat(lesson.pricePerHour) * lesson.duration) / 60;
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
                      <div className="text-sm font-semibold">
                        £{totalPrice.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium">
                    {format(currentDate, "MMMM yyyy")}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-7 gap-0.5 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-1 text-center text-[10px] font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {monthDays.map((day) => {
                    const dayLessons = getLessonsForDate(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedCalendarDate && isSameDay(day, selectedCalendarDate);

                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "min-h-11 p-0.5 border rounded-sm cursor-pointer hover:bg-accent",
                          isToday && "bg-accent",
                          isSelected && "ring-2 ring-primary"
                        )}
                        onClick={() => handleCalendarDateClick(day)}
                      >
                        <div className={cn("text-[9px] font-medium mb-0.5", isToday && "text-primary")}>
                          {format(day, "d")}
                        </div>
                        <div className="space-y-[2px]">
                          {dayLessons.slice(0, 2).map((lesson) => {
                            const student = students.find(s => s.id === lesson.studentId);
                            const isLessonSelected = selectedLessonIds.includes(lesson.id);
                            return (
                              <div
                                key={lesson.id}
                                className="h-1 rounded-full"
                                style={{
                                  backgroundColor: isLessonSelected 
                                    ? (student?.defaultColor || "#3b82f6")
                                    : "#9ca3af",
                                }}
                              />
                            );
                          })}
                          {dayLessons.length > 2 && (
                            <div className="text-[8px] text-muted-foreground text-center">
                              +{dayLessons.length - 2}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedCalendarDate && getLessonsForDate(selectedCalendarDate).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold mb-3">
                      {format(selectedCalendarDate, "EEEE, MMMM d")}
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {getLessonsForDate(selectedCalendarDate).map((lesson) => {
                        const student = students.find(s => s.id === lesson.studentId);
                        const totalPrice = (parseFloat(lesson.pricePerHour) * lesson.duration) / 60;
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer border"
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
                                {format(new Date(lesson.dateTime), 'HH:mm')} - {lesson.subject}
                              </div>
                              {student && (
                                <div className="text-muted-foreground text-xs">
                                  {student.firstName} {student.lastName || ''}
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-semibold">
                              £{totalPrice.toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

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
