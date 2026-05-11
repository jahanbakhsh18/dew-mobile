export interface Ticket {
  DateClosed: any;
  Id: number;
  Description: string;
  DateCreated: string;
  DateUpdated: string;
  SystemId: number;
  ProblemId: number;
  StatusId: number;
  LastActionId: number;
  TimeFlagId: number;
  FilesPath: string;
  CreatorUserId: number;
  ExpireDate: string;
  SystemName: string;
  ProblemName: string;
  StatusName: string;
  TimeFlagColor: string;
  CreatorUsername: string;
}

export interface TicketListResponse {
  Entities: Ticket[];
  TotalCount: number;
  Skip: number;
  Take: number;
}

export interface TicketDetailResponse {
  Entity: Ticket;
  // Add other details like actions, comments, etc. as needed
  Actions?: any[];
  Comments?: any[];
}

export interface ApiError {
  type: 'Network' | 'Server' | 'Unknown';
  message: string;
}