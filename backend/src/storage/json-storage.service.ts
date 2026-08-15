import * as fs from 'fs';
import * as path from 'path';

export interface StorageData {
  users: any[];
  cases: any[];
  messages: any[];
  channels: any[];
}

export class JsonStorageService {
  private dataPath: string;
  private data: StorageData;

  constructor() {
    this.dataPath = path.join(__dirname, '../../data/data.json');
    this.data = this.loadData();
  }

  private loadData(): StorageData {
    try {
      if (fs.existsSync(this.dataPath)) {
        const content = fs.readFileSync(this.dataPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    
    // Return default structure
    return {
      users: [],
      cases: [],
      messages: [],
      channels: []
    };
  }

  private saveData(): void {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Users
  getUsers(): any[] {
    return this.data.users;
  }

  setUsers(users: any[]): void {
    this.data.users = users;
    this.saveData();
  }

  getUserById(id: string): any | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByUsername(username: string): any | undefined {
    return this.data.users.find(u => u.username === username);
  }

  addUser(user: any): void {
    this.data.users.push(user);
    this.saveData();
  }

  updateUser(id: string, updates: Partial<any>): any | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...updates };
      this.saveData();
      return this.data.users[index];
    }
    return undefined;
  }

  deleteUser(id: string): boolean {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.data.users[index].isActive = false;
      this.saveData();
      return true;
    }
    return false;
  }

  // Cases
  getCases(): any[] {
    return this.data.cases;
  }

  setCases(cases: any[]): void {
    this.data.cases = cases;
    this.saveData();
  }

  getCaseById(id: string): any | undefined {
    return this.data.cases.find(c => c.id === id);
  }

  addCase(caseData: any): void {
    this.data.cases.push(caseData);
    this.saveData();
  }

  updateCase(id: string, updates: Partial<any>): any | undefined {
    const index = this.data.cases.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.cases[index] = { ...this.data.cases[index], ...updates };
      this.saveData();
      return this.data.cases[index];
    }
    return undefined;
  }

  deleteCase(id: string): boolean {
    const index = this.data.cases.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.cases.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // Messages
  getMessages(): any[] {
    return this.data.messages;
  }

  setMessages(messages: any[]): void {
    this.data.messages = messages;
    this.saveData();
  }

  getMessagesByChannel(channelId: string): any[] {
    return this.data.messages.filter(m => m.channelId === channelId);
  }

  addMessage(message: any): void {
    this.data.messages.push(message);
    this.saveData();
  }

  // Channels
  getChannels(): any[] {
    return this.data.channels;
  }

  setChannels(channels: any[]): void {
    this.data.channels = channels;
    this.saveData();
  }

  getChannelById(id: string): any | undefined {
    return this.data.channels.find(c => c.id === id);
  }

  getChannelByCaseId(caseId: string): any | undefined {
    return this.data.channels.find(c => c.caseId === caseId);
  }

  addChannel(channel: any): void {
    this.data.channels.push(channel);
    this.saveData();
  }

  updateChannel(id: string, updates: Partial<any>): any | undefined {
    const index = this.data.channels.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.channels[index] = { ...this.data.channels[index], ...updates };
      this.saveData();
      return this.data.channels[index];
    }
    return undefined;
  }

  // Initialize with seed data
  initializeWithSeed(seedData: StorageData): void {
    this.data = seedData;
    this.saveData();
  }

  // Check if data exists
  hasData(): boolean {
    return this.data.users.length > 0;
  }
}

// Singleton instance
export const jsonStorageService = new JsonStorageService();
