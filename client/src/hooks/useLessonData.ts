
import { useLessons } from './useLessons';
import { useStudents } from './useStudents';
import { transformLessonWithStudent } from '@/utils/lessonHelpers';

export function useLessonData() {
  const { data: lessonsData = [], isLoading: lessonsLoading } = useLessons();
  const { data: studentsData = [] } = useStudents();

  const displayLessons = (lessonsData as any[]).map((lesson: any) => {
    const student = (studentsData as any[]).find(
      (s: any) => s.id === lesson.studentId,
    );
    return transformLessonWithStudent(lesson, student);
  });

  return {
    lessonsData,
    studentsData,
    displayLessons,
    lessonsLoading,
  };
}
