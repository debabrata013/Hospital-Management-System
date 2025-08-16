// Mock LeaveRequest model for development
export default class LeaveRequest {
  constructor(data: any) {
    Object.assign(this, data);
  }

  async save(): Promise<void> {
    // Mock save method
    console.log('LeaveRequest saved:', this);
  }
}
