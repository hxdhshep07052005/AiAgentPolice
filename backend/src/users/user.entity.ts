export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'lanh-dao' | 'can-bo' | 'quan-tri';
  title: string;
  department: string;
  skills: string[];
  level: number;
  isActive: boolean;
  createdAt: Date;
}
