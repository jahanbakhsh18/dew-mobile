import { apiClient } from "./apiClient";
import { Ticket, TicketListResponse, TicketDetailResponse } from '../types/ticketTypes';

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

    try {
      const response = await apiClient.post<TicketListResponse>(
        "/Services/Ticket/Ticket/List",
        requestData
      );
      
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch tickets');
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async getTicketDetails(entityId: number): Promise<TicketDetailResponse> {
    try {
      const response = await apiClient.post<TicketDetailResponse>(
        "/Services/Ticket/Ticket/Retrieve",
        { EntityId: entityId }
      );
      
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch ticket details');
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      throw error;
    }
  }
}

export default new TicketService();


/*
export const ticketService = {
  list: () =>
    apiClient.post("/Services/Ticket/Ticket/List", {}),

  retrieve: (id: number) =>
    apiClient.post("/Services/Ticket/Ticket/Retrieve", { EntityId: id }),

  create: (entity: any) =>
    apiClient.post("/Services/Ticket/Ticket/Create", { Entity: entity })
};
*/