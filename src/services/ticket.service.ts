import { apiClient } from "./apiClient";
import { TicketListResponse, TicketDetailResponse, CreateTicketRequest, CreateTicketResponse } from '../types/ticket.types';

export interface TicketListRequest {
  Take: number;
  Sort: string[];
  IncludeColumns: string[];
  EqualityFilter: {
    StatusId: string;
    SystemId: string;
    ProblemId: string;
  };
}

export interface FilterOptions {
  statusId?: string;
  systemId?: string;
  problemId?: string;
  take?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class TicketService {
  private defaultIncludeColumns = [
    "Id",
    "StatusName",
    "TimeFlagColor",
    "SystemName",
    "ProblemName",
    "CreatorUsername",
    "DateCreated",
    "ExpireDate",
    "DateClosed"
  ];

  async getTicketList(filters: FilterOptions = {}): Promise<TicketListResponse> {
    const requestData: TicketListRequest = {
      Take: filters.take || 100,
      Sort: [`${filters.sortBy || 'DateCreated'} ${filters.sortOrder || 'DESC'}`],
      IncludeColumns: this.defaultIncludeColumns,
      EqualityFilter: {
        StatusId: filters.statusId || "",
        SystemId: filters.systemId || "",
        ProblemId: filters.problemId || ""
      }
    };

    const response = await apiClient.post<TicketListResponse>(
      "/Services/Ticket/Ticket/List",
      requestData
    );

    return response.data;
  }

  async getTicketDetails(entityId: number): Promise<TicketDetailResponse> {

    const response = await apiClient.post<TicketDetailResponse>(
      "/Services/Ticket/Ticket/Retrieve",
      { EntityId: entityId }
    );

    return response.data;
  }

  async createTicket(ticket: CreateTicketRequest): Promise<CreateTicketResponse> {

    const response = await apiClient.post<CreateTicketResponse>(
      "/Services/Ticket/Ticket/Create",
      { Entity: ticket }
    );

    return response.data;
  }
}

export default new TicketService();