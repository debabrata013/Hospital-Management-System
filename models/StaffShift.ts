// Mock StaffShift model for development
export default class StaffShift {
  constructor(data: any) {
    Object.assign(this, data);
  }

  async save(): Promise<void> {
    // Mock save method
    console.log('StaffShift saved:', this);
  }
}
