export interface BffProfileUserDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  photoUrl?: string | null;
  registrationDate: Date;
}

export interface BffProfileTariffDto {
  id: string;
  startDate: Date;
  endDate: Date;
  status: string;
  tariff?: {
    id: string;
    type: string;
    description?: string | null;
  } | null;
}

export interface BffProfileEnrollmentDto {
  id: string;
  status: string;
  createdAt: Date;
  timetableEntry?: {
    id: string;
    type: string;
    date: Date;
    startTime: string;
    endTime: string;
    hall: string;
    trainer?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export interface BffProfileResponseDto {
  user: BffProfileUserDto;
  activeTariff: BffProfileTariffDto | null;
  upcomingEnrollments: BffProfileEnrollmentDto[];
  attendedEnrollments: BffProfileEnrollmentDto[];
}
