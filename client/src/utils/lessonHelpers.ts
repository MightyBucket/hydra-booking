
export const handleJoinLessonLink = (lessonLink?: string) => {
  if (lessonLink) {
    window.open(lessonLink, "_blank");
  }
};

export const transformLessonWithStudent = (lesson: any, student: any) => ({
  ...lesson,
  dateTime: new Date(lesson.dateTime),
  studentName: student
    ? `${student.firstName} ${student.lastName || ""}`
    : "Unknown Student",
  studentColor: student?.defaultColor || "#3b82f6",
  pricePerHour: parseFloat(lesson.pricePerHour),
});

export const calculateStudentStats = (student: any, lessons: any[]) => {
  const studentLessons = lessons.filter(
    (lesson: any) => lesson.studentId === student.id
  );

  const lessonCount = studentLessons.length;

  let lastLessonDate: Date | undefined;
  if (studentLessons.length > 0) {
    const now = new Date();
    const pastLessons = studentLessons.filter(
      (lesson: any) => new Date(lesson.dateTime) <= now
    );

    if (pastLessons.length > 0) {
      const sortedLessons = pastLessons.sort(
        (a: any, b: any) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );
      lastLessonDate = new Date(sortedLessons[0].dateTime);
    }
  }

  return {
    ...student,
    defaultRate: student.defaultRate ? parseFloat(student.defaultRate) : undefined,
    lessonCount,
    lastLessonDate,
  };
};
