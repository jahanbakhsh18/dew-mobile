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
  Actions?: any[];
  Comments?: any[];
}

export interface CreateTicketRequest {
  SystemId: string | number;
  ProblemId: string | number;
  Description: string;
  FilesPath: string;
  StatusId: string | number;
  LastActionId: string | number;
}

export interface CreateTicketResponse {
  EntityId: number;
}

export interface ApiError {
  type: 'Network' | 'Server' | 'Unknown';
  message: string;
}

export interface TemporaryFileResponse {
  TemporaryFile: string;
  Size: number;
  IsImage: boolean;
  Width: number;
  Height: number;
}

export interface FileAttachment {
  OriginalName: string;
  Filename: string;
}

export interface SelectedFile {
  Uri: string;
  Name: string;
  Type: string;
}