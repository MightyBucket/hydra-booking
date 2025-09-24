import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';

interface Lesson {
  id: string;
  subject: string;
  dateTime: Date;
  studentName: string;
  duration: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  pricePerHour: number;
}

interface CalendarViewProps {
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
  onDateClick: (date: Date) => void;
}

export default function CalendarView({ lessons, onLessonClick, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const days = view === 'month' ? monthDays : weekDays;

  const getLessonsForDate = (date: Date) => {
    return lessons.filter(lesson => isSameDay(lesson.dateTime, date));
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'lesson-confirmed';
      case 'pending': return 'lesson-pending'; 
      case 'overdue': return 'lesson-cancelled';
      default: return 'secondary';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  return (
    <Card className="w-full h-full" data-testid="calendar-view">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {format(currentDate, 'MMMM yyyy')}
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              data-testid="button-month-view"
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              data-testid="button-week-view"
            >
              Week
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dayLessons = getLessonsForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-24 p-2 border rounded-md cursor-pointer hover-elevate
                  ${isToday ? 'bg-accent' : 'bg-card'}
                `}
                onClick={() => onDateClick(day)}
                data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayLessons.slice(0, 3).map(lesson => (
                    <div
                      key={lesson.id}
                      className="p-1 rounded text-xs cursor-pointer hover-elevate"
                      style={{ backgroundColor: `hsl(var(--chart-2) / 0.1)` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLessonClick(lesson);
                      }}
                      data-testid={`lesson-${lesson.id}`}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="truncate">{format(lesson.dateTime, 'HH:mm')}</span>
                      </div>
                      <div className="truncate font-medium">{lesson.subject}</div>
                      <div className="truncate text-muted-foreground">{lesson.studentName}</div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs bg-${getPaymentStatusColor(lesson.paymentStatus)}`}
                      >
                        {lesson.paymentStatus}
                      </Badge>
                    </div>
                  ))}
                  
                  {dayLessons.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayLessons.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}