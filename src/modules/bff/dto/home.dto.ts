export interface BffHomeTariffDto {
  id: string;
  type: string;
  description?: string | null;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
}

export interface BffHomeTrainerDto {
  id: string;
  name: string;
  specialty: string[];
  experience?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  rating?: number | null;
  reviews: number;
}

export interface BffHomeScheduleDto {
  id: string;
  type: string;
  hall: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
  availableSlots: number;
  status: string;
  trainer?: {
    id: string;
    name: string;
  } | null;
}

export interface BffHomeResponseDto {
  tariffs: BffHomeTariffDto[];
  trainers: BffHomeTrainerDto[];
  upcomingClasses: BffHomeScheduleDto[];
}
