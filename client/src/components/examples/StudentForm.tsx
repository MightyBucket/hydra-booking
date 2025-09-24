import StudentForm from '../StudentForm';

export default function StudentFormExample() {
  const handleSubmit = (studentData: any) => {
    console.log('Student submitted:', studentData);
  };

  const handleCancel = () => {
    console.log('Student form cancelled');
  };

  return (
    <StudentForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}