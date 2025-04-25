// --- Interfaces ---
export interface ListItem {
  id: string;
  name: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  startDate?: string; // 날짜 키 (YYYY-MM-DD) 형식
  endDate?: string; // 날짜 키 (YYYY-MM-DD) 형식
  color?: string; // Optional color property for range todos
}

export interface TodosByDate {
  [dateKey: string]: TodoItem[];
}

export interface TodosState {
  [listId: string]: TodosByDate;
}
