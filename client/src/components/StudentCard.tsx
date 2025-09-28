import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  BookOpen,
  DollarSign,
  Edit,
  Calendar,
  Trash2,
} from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  defaultSubject?: string;
  defaultRate?: number;
  defaultColor?: string;
  lessonCount?: number;
  lastLessonDate?: Date;
}

interface StudentCardProps {
  student: Student;
  onEdit: (studentId: string) => void;
  onScheduleLesson: (studentId: string) => void;
  onViewLessons: (studentId: string) => void;
  onDelete: (studentId: string) => void;
}

export default function StudentCard({
  student,
  onEdit,
  onScheduleLesson,
  onViewLessons,
  onDelete,
}: StudentCardProps) {
  const firstName = student.firstName || "Unknown";
  const lastName = student.lastName || "";

  const initials = lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName.charAt(0);
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;

  return (
    <Card className="hover-elevate" data-testid={`student-card-${student.id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: student.defaultColor || '#3b82f6' }}
            title="Student color"
          />
          <CardTitle className="text-lg font-semibold">
            {student.firstName} {student.lastName || ''}
          </CardTitle>
        </div>
        {student.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{student.email}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {student.phoneNumber && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{student.phoneNumber}</span>
            </div>
          )}

          {student.defaultSubject && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{student.defaultSubject}</span>
            </div>
          )}

          {student.defaultRate && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>£{student.defaultRate}/hour</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {student.lessonCount !== undefined && (
              <Badge variant="secondary">{student.lessonCount} lessons</Badge>
            )}
            {student.lastLessonDate && (
              <span className="text-xs text-muted-foreground">
                Last: {student.lastLessonDate.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onScheduleLesson(student.id)}
            data-testid={`button-schedule-lesson-${student.id}`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewLessons(student.id)}
            data-testid={`button-view-lessons-${student.id}`}
          >
            View Lessons
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(student.id)}
            data-testid={`button-edit-student-${student.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(student.id)}
            data-testid={`button-delete-student-${student.id}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}