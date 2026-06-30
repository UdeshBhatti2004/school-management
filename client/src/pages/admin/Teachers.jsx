import { GraduationCap } from 'lucide-react';
import UsersManager from './UsersManager';

export default function Teachers() {
  return (
    <UsersManager
      role="teacher"
      title="Teachers"
      subtitle="Manage teaching staff, departments, and subject assignments."
      icon={GraduationCap}
    />
  );
}
