import { Select } from './Select';
import type { SponsoredStudent } from '../types/sponsor';

interface SponsoredStudentSelectorProps {
  students: readonly SponsoredStudent[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  enabled?: boolean;
}

export function SponsoredStudentSelector({
  students,
  selectedStudentId,
  onSelectStudent,
  enabled = true,
}: SponsoredStudentSelectorProps) {
  return (
    <Select
      enabled={enabled && students.length > 0}
      label="Sponsored student"
      onValueChange={onSelectStudent}
      options={[
        { label: 'All sponsored students', value: 'all' },
        ...students.map((student) => ({ label: student.name, value: String(student.id) })),
      ]}
      value={selectedStudentId}
    />
  );
}
