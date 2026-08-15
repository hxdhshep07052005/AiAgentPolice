import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { v4 as uuid } from 'uuid';
import { jsonStorageService } from '../storage/json-storage.service';

// 10 Demo Users
const SEED_USERS: Partial<User>[] = [
  {
    id: 'admin-001',
    username: 'admin',
    password: '123456',
    name: 'Nguyễn Văn Admin',
    role: 'quan-tri',
    title: 'Quản trị viên hệ thống',
    department: 'Phòng Công nghệ thông tin',
    skills: ['quan-ly-he-thong'],
    level: 1,
  },
  {
    id: 'lead-001',
    username: 'truongnhom1',
    password: '123456',
    name: 'Trần Văn A',
    role: 'lanh-dao',
    title: 'Trưởng nhóm điều tra',
    department: 'Phòng Điều tra hình sự',
    skills: ['dieu-tra', 'quan-ly', 'phan-tich'],
    level: 2,
  },
  {
    id: 'lead-002',
    username: 'truongnhom2',
    password: '123456',
    name: 'Lê Thị B',
    role: 'lanh-dao',
    title: 'Trưởng nhóm giám định',
    department: 'Phòng Giám định kỹ thuật',
    skills: ['dieu-tra', 'quan-ly', 'hoan-tat'],
    level: 2,
  },
  {
    id: 'member-001',
    username: 'thanhvien1',
    password: '123456',
    name: 'Phạm Văn C',
    role: 'can-bo',
    title: 'Điều tra viên',
    department: 'Phòng Điều tra hình sự',
    skills: ['kham-nghiem', 'chup-anh', 'thu-thap-dau-vet'],
    level: 3,
  },
  {
    id: 'member-002',
    username: 'thanhvien2',
    password: '123456',
    name: 'Hoàng Thị D',
    role: 'can-bo',
    title: 'Chuyên viên kỹ thuật',
    department: 'Phòng Công nghệ thông tin',
    skills: ['tra-camera', 'phan-tich-anh'],
    level: 3,
  },
  {
    id: 'member-003',
    username: 'thanhvien3',
    password: '123456',
    name: 'Ngô Văn E',
    role: 'can-bo',
    title: 'Giám định viên',
    department: 'Phòng Giám định kỹ thuật',
    skills: ['giam-dinh', 'doi-chung-chi'],
    level: 3,
  },
  {
    id: 'member-004',
    username: 'thanhvien4',
    password: '123456',
    name: 'Đặng Thị F',
    role: 'can-bo',
    title: 'Điều tra viên',
    department: 'Phòng Điều tra hình sự',
    skills: ['tham-van', 'phan-tich'],
    level: 3,
  },
  {
    id: 'member-005',
    username: 'thanhvien5',
    password: '123456',
    name: 'Bùi Văn G',
    role: 'can-bo',
    title: 'Điều tra viên',
    department: 'Phòng Điều tra hình sự',
    skills: ['kham-nghiem', 'giam-dinh'],
    level: 3,
  },
  {
    id: 'member-006',
    username: 'thanhvien6',
    password: '123456',
    name: 'Trịnh Thị H',
    role: 'can-bo',
    title: 'Chuyên viên kỹ thuật',
    department: 'Phòng Công nghệ thông tin',
    skills: ['tra-camera', 'phan-tich-anh', 'doi-chung-chi'],
    level: 3,
  },
  {
    id: 'member-007',
    username: 'thanhvien7',
    password: '123456',
    name: 'Vũ Văn I',
    role: 'can-bo',
    title: 'Điều tra viên',
    department: 'Phòng Điều tra hình sự',
    skills: ['thu-thap-dau-vet', 'phan-tich'],
    level: 3,
  },
];

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    // Try to load from JSON storage first
    const storedUsers = jsonStorageService.getUsers();
    if (storedUsers && storedUsers.length > 0) {
      this.users = storedUsers.map((u: any) => ({
        ...u,
        isActive: u.isActive !== false,
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      }));
      console.log(`✅ Loaded ${this.users.length} users from JSON storage`);
    } else {
      // Load seed users and save to JSON
      this.users = SEED_USERS.map(u => ({
        ...u,
        isActive: true,
        createdAt: new Date(),
      })) as User[];
      jsonStorageService.setUsers(this.users);
      console.log(`✅ Loaded ${this.users.length} seed users`);
    }
  }

  private saveUsers() {
    jsonStorageService.setUsers(this.users);
  }

  findAll(): User[] {
    return this.users.filter(u => u.isActive).map(u => this.sanitizeUser(u));
  }

  findById(id: string): User | undefined {
    const user = this.users.find(u => u.id === id);
    return user ? this.sanitizeUser(user) : undefined;
  }

  findByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username && u.isActive);
  }

  findByRole(role: string): User[] {
    return this.users.filter(u => u.role === role && u.isActive).map(u => this.sanitizeUser(u));
  }

  authenticate(username: string, password: string): User | null {
    const user = this.users.find(u => u.username === username && u.password === password && u.isActive);
    return user ? this.sanitizeUser(user) : null;
  }

  create(data: Partial<User>): User {
    const user: User = {
      id: uuid(),
      username: data.username || '',
      password: data.password || '123456',
      name: data.name || '',
      role: data.role || 'can-bo',
      title: data.title || '',
      department: data.department || '',
      skills: data.skills || [],
      level: data.level || 3,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.push(user);
    this.saveUsers();
    return this.sanitizeUser(user);
  }

  update(id: string, data: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data, id: this.users[index].id };
    this.saveUsers();
    return this.sanitizeUser(this.users[index]);
  }

  delete(id: string): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users[index].isActive = false;
    this.saveUsers();
    return true;
  }

  private sanitizeUser(user: User): User {
    const { password, ...sanitized } = user;
    return sanitized as User;
  }
}
