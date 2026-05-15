export class ScheduleCardDto {
  id: string;
  type: string;
  date: Date;
  startTime: string;
  endTime: string;
  hall: string;
  capacity: number;
  enrolled: number;
  availableSlots: number;
  status: string;
  trainer: {
    id: string;
    name?: string;
    photoUrl?: string;
    specialty?: string[];
  } | null;
}
