// Mock StaffProfile model for development
export default class StaffProfile {
  constructor(data: any) {
    Object.assign(this, data);
  }

  async save(): Promise<void> {
    // Mock save method
    console.log('StaffProfile saved:', this);
  }
}
