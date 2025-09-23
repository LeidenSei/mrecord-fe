export class AcademicWeek {
  constructor(
    public weekNo: number,
    public startDate: Date,
    public endDate: Date,
    public schoolYear: string
  ) {}

  get range(): string {
    return `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
  }

  isInRange(date: Date): boolean {
    const d = new Date(date).setHours(0,0,0,0);
    const start = new Date(this.startDate).setHours(0,0,0,0);
    const end = new Date(this.endDate).setHours(23,59,59,999);
    return d >= start && d <= end;
  }
}
