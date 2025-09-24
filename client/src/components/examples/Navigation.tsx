import Navigation from '../Navigation';

export default function NavigationExample() {
  const handleAddLesson = () => {
    console.log('Add lesson clicked');
  };

  const handleAddStudent = () => {
    console.log('Add student clicked');
  };

  return (
    <div className="h-screen bg-background">
      <Navigation
        onAddLesson={handleAddLesson}
        onAddStudent={handleAddStudent}
        lessonCount={25}
        studentCount={8}
      />
    </div>
  );
}