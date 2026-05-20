export interface SerenityLookupResponse<T = any> {
  Items: T[];
  Params: {
    idField: string;
    textField: string;
  };
}

export interface SystemItem {
  Id: number;
  Name: string;
}

export interface ProblemItem {
  Id: number;
  Name: string;
  SystemId: number;
  SystemName: string;
}

export interface DropdownOption {
  label: string;
  value: string | number;
}