// Mock AuditLog model for development
export default class AuditLog {
  constructor(data: any) {
    Object.assign(this, data);
  }

  async save(): Promise<void> {
    // Mock save method
    console.log('AuditLog saved:', this);
  }
}
