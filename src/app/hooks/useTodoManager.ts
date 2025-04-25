import { type User } from "@supabase/supabase-js"; // Import User type
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListItem, TodoItem, TodosByDate, TodosState } from "../types";
import { generatePastelColor } from "../utils/colors";
import {
  formatDateKey,
  isWithinInterval,
  parseDateKey,
  startOfMonth,
} from "../utils/date-helpers";
// Import Supabase client if needed for data fetching/mutation
// import { createClient } from "@/lib/supabase/client";

// --- Initial Data (Consider removing if fully Supabase driven) ---
const defaultLists: ListItem[] = [
  { id: "1", name: "Work" },
  { id: "2", name: "Home" },
  { id: "3", name: "Study" },
];
const todayKey = formatDateKey(new Date());
const initialTodos: TodosState = {
  "1": {
    [todayKey]: [{ id: "t1", text: "Team meeting", completed: false }],
  },
  "2": { [todayKey]: [{ id: "t2", text: "Clean kitchen", completed: true }] },
  "3": {},
};

// --- Hook Definition ---
export function useTodoManager(user: User | null) {
  // Accept user as argument
  // const supabase = createClient(); // Initialize Supabase client if needed

  // --- State Declarations ---
  const [isLoading, setIsLoading] = useState(true);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [_selectedListId, _setSelectedListId] = useState<string | null>(null);
  const [todosByListId, setTodosByListId] = useState<TodosState>({});
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(new Date())
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDraggingRange, setIsDraggingRange] = useState<boolean>(false);
  const [rangeSelectionStart, setRangeSelectionStart] = useState<Date | null>(
    null
  );
  const [rangeSelectionEndHover, setRangeSelectionEndHover] =
    useState<Date | null>(null);
  const [isCreateListModalOpen, setIsCreateListModalOpen] =
    useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>("");
  const [isDeleteListModalOpen, setIsDeleteListModalOpen] =
    useState<boolean>(false);
  const [listToDeleteId, setListToDeleteId] = useState<string | null>(null);
  const [isDeleteTodoModalOpen, setIsDeleteTodoModalOpen] =
    useState<boolean>(false);
  const [todoToDelete, setTodoToDelete] = useState<TodoItem | null>(null);
  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState<boolean>(false);
  const [addTodoTargetDate, setAddTodoTargetDate] = useState<Date | null>(null);
  const [addTodoTargetRange, setAddTodoTargetRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [newTodoTextForModal, setNewTodoTextForModal] = useState<string>("");

  const createListInputRef = useRef<HTMLInputElement>(null);
  const addTodoModalInputRef = useRef<HTMLInputElement>(null);

  // --- Data Loading Effect ---
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (user) {
        // --- User is LOGGED IN: Load data from Supabase ---
        console.log("User logged in, loading data from Supabase...");
        // Example: Fetch lists and todos from Supabase tables
        // const { data: listsData, error: listsError } = await supabase
        //   .from('lists') // Replace with your table name
        //   .select('*')
        //   .eq('user_id', user.id); // Filter by user ID

        // const { data: todosData, error: todosError } = await supabase
        //   .from('todos') // Replace with your table name
        //   .select('*')
        //   .eq('user_id', user.id); // Filter by user ID

        // if (listsError || todosError) {
        //   console.error("Error loading data from Supabase:", listsError || todosError);
        //   // Handle error (e.g., set default data, show error message)
        //   setLists(defaultLists);
        //   setTodosByListId(initialTodos);
        // } else {
        //   // Process and set state from Supabase data
        //   setLists(listsData || []);
        //   // Need to transform todosData into TodosState format
        //   const formattedTodos = formatTodosFromDb(todosData || []);
        //   setTodosByListId(formattedTodos);
        //
        //   // Select first list or null
        //   _setSelectedListId(listsData && listsData.length > 0 ? listsData[0].id : null);
        // }

        // --- Placeholder: Use default data for now ---
        setLists(defaultLists);
        setTodosByListId(initialTodos);
        _setSelectedListId(defaultLists.length > 0 ? defaultLists[0].id : null);
        // ------------------------------------------------
      } else {
        // --- User is LOGGED OUT: Load data from localStorage ---
        console.log("User logged out, loading data from localStorage...");
        try {
          const savedListsRaw = localStorage.getItem("todoAppLists");
          const savedTodosRaw = localStorage.getItem("todoAppTodos");
          const lastSelectedId = localStorage.getItem(
            "todoAppLastSelectedListId"
          );

          let loadedLists = defaultLists;
          let loadedTodos = initialTodos;

          if (savedListsRaw) {
            try {
              const parsedLists = JSON.parse(savedListsRaw);
              if (
                Array.isArray(parsedLists) &&
                parsedLists.every(
                  (
                    item
                  ): item is ListItem => // Type guard
                    typeof item.id === "string" && typeof item.name === "string"
                )
              ) {
                loadedLists = parsedLists;
              } else {
                console.warn(
                  "Invalid lists data found in localStorage. Using defaults."
                );
                localStorage.removeItem("todoAppLists");
              }
            } catch (e) {
              console.error(
                "Failed to parse lists from localStorage. Using defaults.",
                e
              );
              localStorage.removeItem("todoAppLists");
            }
          }

          if (savedTodosRaw) {
            try {
              const parsedTodos = JSON.parse(savedTodosRaw);
              if (
                typeof parsedTodos === "object" &&
                parsedTodos !== null &&
                !Array.isArray(parsedTodos)
              ) {
                if (
                  Object.values(parsedTodos).every(
                    (val): val is TodosByDate =>
                      typeof val === "object" && val !== null
                  )
                ) {
                  // TODO: Add deeper validation for TodoItem structure if needed
                  loadedTodos = parsedTodos as TodosState;
                } else {
                  console.warn(
                    "Invalid structure in todos data found in localStorage. Using defaults."
                  );
                  localStorage.removeItem("todoAppTodos");
                }
              } else {
                console.warn(
                  "Invalid todos data found in localStorage. Using defaults."
                );
                localStorage.removeItem("todoAppTodos");
              }
            } catch (e) {
              console.error(
                "Failed to parse todos from localStorage. Using defaults.",
                e
              );
              localStorage.removeItem("todoAppTodos");
            }
          }

          setLists(loadedLists);
          setTodosByListId(loadedTodos);

          if (
            lastSelectedId &&
            loadedLists.some((list) => list.id === lastSelectedId)
          ) {
            _setSelectedListId(lastSelectedId);
          } else if (loadedLists.length > 0) {
            _setSelectedListId(loadedLists[0].id);
          } else {
            _setSelectedListId(null);
          }
        } catch (error) {
          console.error("Error loading data from localStorage:", error);
          setLists(defaultLists);
          setTodosByListId(initialTodos);
          _setSelectedListId(
            defaultLists.length > 0 ? defaultLists[0].id : null
          );
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [user]); // Reload data when user logs in or out

  // --- LocalStorage Save Effects (Only run when logged out) ---
  useEffect(() => {
    if (!isLoading && !user) {
      try {
        localStorage.setItem("todoAppLists", JSON.stringify(lists));
      } catch (error) {
        console.error("Error saving lists to localStorage:", error);
      }
    }
  }, [lists, isLoading, user]);

  useEffect(() => {
    if (!isLoading && !user) {
      try {
        localStorage.setItem("todoAppTodos", JSON.stringify(todosByListId));
      } catch (error) {
        console.error("Error saving todos to localStorage:", error);
      }
    }
  }, [todosByListId, isLoading, user]);

  useEffect(() => {
    if (!isLoading && !user && _selectedListId) {
      try {
        localStorage.setItem("todoAppLastSelectedListId", _selectedListId);
      } catch (error) {
        console.error("Error saving last selected list ID:", error);
      }
    } else if (!isLoading && !user && !_selectedListId) {
      localStorage.removeItem("todoAppLastSelectedListId");
    }
  }, [_selectedListId, isLoading, user]);

  // --- Derived State ---
  const selectedList = useMemo(
    () => lists.find((list) => list.id === _selectedListId), // Use internal state
    [lists, _selectedListId]
  );
  const selectedDateKey = useMemo(
    () => formatDateKey(selectedDate),
    [selectedDate]
  );

  const todosForSelectedList = useMemo(() => {
    if (!_selectedListId || !todosByListId[_selectedListId]) return [];
    return Object.values(todosByListId[_selectedListId]).flat();
  }, [_selectedListId, todosByListId]);

  const todosForSelectedDate: TodoItem[] = useMemo(() => {
    if (!_selectedListId || !todosByListId[_selectedListId]) return [];
    const listTodos = todosByListId[_selectedListId];
    const dateTodos: TodoItem[] = listTodos[selectedDateKey] || [];
    const addedTodoIds = new Set(dateTodos.map((t) => t.id));

    // Iterate through all entries in the list's todos
    Object.entries(listTodos).forEach(([currentDateKey, todos]) => {
      // Use currentDateKey here
      // Process range todos
      todos.forEach((todo) => {
        if (todo.endDate && !addedTodoIds.has(todo.id)) {
          const startDate = parseDateKey(todo.startDate!);
          const endDate = parseDateKey(todo.endDate);
          // Check if the selectedDate falls within the todo's range
          if (isWithinInterval(selectedDate, startDate, endDate)) {
            // Also check if the current iteration key is the START date of the range todo
            // This prevents adding the todo multiple times if iterating through its range
            if (currentDateKey === todo.startDate) {
              // Use currentDateKey
              dateTodos.push(todo);
              addedTodoIds.add(todo.id);
            }
          }
        }
      });
    });

    dateTodos.sort((a, b) => (!!a.endDate ? 1 : -1) - (!!b.endDate ? 1 : -1));
    return dateTodos;
  }, [_selectedListId, selectedDate, todosByListId, selectedDateKey]);

  // --- Modal Close Handlers (Declare before handlers that use them) ---
  const closeAddTodoModal = useCallback(() => {
    setIsAddTodoModalOpen(false);
    setAddTodoTargetDate(null);
    setAddTodoTargetRange(null);
    setNewTodoTextForModal("");
  }, []);

  const closeDeleteTodoModal = useCallback(() => {
    setTodoToDelete(null);
    setIsDeleteTodoModalOpen(false);
  }, []);

  // --- Event Handlers (Adjust signatures) ---
  const handleSelectList = useCallback((listId: string) => {
    _setSelectedListId(listId);
  }, []);

  const confirmCreateList = useCallback(async () => {
    if (!newListName.trim()) return;
    const newId = Date.now().toString(); // Simple ID generation
    const newList: ListItem = {
      id: newId,
      name: newListName.trim(),
      color: generatePastelColor(),
    };

    if (user) {
      // TODO: Add Supabase logic to insert the new list
      console.log("TODO: Add list to Supabase", newList);
      // Example:
      // const { error } = await supabase.from('lists').insert({ ...newList, user_id: user.id })
      // if (error) console.error("Failed to save list to DB") else { ... update state ... }
      setLists((prev) => [...prev, newList]); // Optimistic update
    } else {
      setLists((prev) => [...prev, newList]);
    }

    setNewListName("");
    setIsCreateListModalOpen(false);
    _setSelectedListId(newId); // Select the new list
  }, [newListName, user]);

  // ... (Modify other handlers like handleRenameList, confirmDeleteList, confirmAddTodo, etc.)
  // ... Example: confirmDeleteList
  const confirmDeleteList = useCallback(async () => {
    if (!listToDeleteId) return;
    if (user) {
      // TODO: Add Supabase logic to delete list
      console.log("TODO: Delete list from Supabase", listToDeleteId);
    }
    setLists((prev) => prev.filter((list) => list.id !== listToDeleteId));
    setTodosByListId((prev) => {
      const newState = { ...prev };
      delete newState[listToDeleteId];
      return newState;
    });
    if (_selectedListId === listToDeleteId) {
      _setSelectedListId(
        lists.length > 1
          ? lists.find((l) => l.id !== listToDeleteId)?.id ?? null
          : null
      );
    }
    closeDeleteListModal();
  }, [listToDeleteId, user, lists, _selectedListId]);

  // ... (Rest of the handlers, ensuring they check 'user' status for Supabase calls)
  const handleRenameList = useCallback(
    (listId: string, newName: string) => {
      const trimmedName = newName.trim();
      if (trimmedName === "") return;
      if (user) {
        console.log("TODO: Rename list in Supabase", listId, trimmedName);
      }
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, name: trimmedName } : list
        )
      );
    },
    [user]
  );
  const confirmAddTodoFromModal = useCallback(async () => {
    const text = newTodoTextForModal.trim();
    if (text === "" || !_selectedListId) return;
    const listId = _selectedListId;
    const newTodoBase: Omit<
      TodoItem,
      "id" | "startDate" | "endDate" | "color"
    > &
      Partial<Pick<TodoItem, "startDate" | "endDate" | "color">> = {
      text,
      completed: false,
    };
    let newTodo: TodoItem | null = null;
    let targetDateKey: string | null = null;
    if (addTodoTargetDate) {
      targetDateKey = formatDateKey(addTodoTargetDate);
      newTodo = { ...newTodoBase, id: `t-${Date.now()}` };
    } else if (addTodoTargetRange) {
      targetDateKey = formatDateKey(addTodoTargetRange.start);
      newTodo = {
        ...newTodoBase,
        id: `t-range-${Date.now()}`,
        startDate: formatDateKey(addTodoTargetRange.start),
        endDate: formatDateKey(addTodoTargetRange.end),
        color: generatePastelColor(),
      };
    }
    if (newTodo && targetDateKey) {
      const todoToAdd = newTodo;
      const keyForTodo = targetDateKey;
      if (user) {
        console.log(
          "TODO: Add todo to Supabase",
          todoToAdd,
          "for list",
          listId
        );
      }
      setTodosByListId((prevTodos: TodosState) => {
        const updatedListTodos = { ...(prevTodos[listId] || {}) };
        const dateTodos = updatedListTodos[keyForTodo] || [];
        updatedListTodos[keyForTodo] = [...dateTodos, todoToAdd];
        return { ...prevTodos, [listId]: updatedListTodos };
      });
    }
    closeAddTodoModal();
  }, [
    newTodoTextForModal,
    _selectedListId,
    addTodoTargetDate,
    addTodoTargetRange,
    user,
    closeAddTodoModal,
  ]);

  const handleToggleTodo = useCallback(
    async (todoId: string) => {
      if (!_selectedListId) return;
      const listId = _selectedListId;
      const listTodos = todosByListId[listId] || {};
      let dateKeyToUpdate: string | null = null;
      let todoToUpdate: TodoItem | null = null;
      outerLoop: for (const key in listTodos) {
        for (const todo of listTodos[key]) {
          if (todo.id === todoId) {
            todoToUpdate = todo;
            dateKeyToUpdate = key;
            break outerLoop;
          }
        }
      }
      if (!todoToUpdate || !dateKeyToUpdate) return;
      const allowToggle =
        !todoToUpdate.endDate || dateKeyToUpdate === selectedDateKey;
      if (!allowToggle) {
        alert("Range todos can only be toggled from their start date.");
        return;
      }
      const newCompletedStatus = !todoToUpdate.completed;
      if (user) {
        console.log(
          "TODO: Update todo in Supabase",
          todoId,
          newCompletedStatus
        );
      }
      const key = dateKeyToUpdate;
      setTodosByListId((prevTodos: TodosState) => {
        const currentListTodos = prevTodos[listId];
        if (!currentListTodos || !currentListTodos[key]) return prevTodos;
        const updatedDateTodos = currentListTodos[key].map((t: TodoItem) =>
          t.id === todoId ? { ...t, completed: newCompletedStatus } : t
        );
        return {
          ...prevTodos,
          [listId]: { ...currentListTodos, [key]: updatedDateTodos },
        };
      });
    },
    [_selectedListId, todosByListId, user, selectedDateKey]
  );

  const confirmDeleteTodo = useCallback(async () => {
    if (!_selectedListId || !todoToDelete) return;
    const listId = _selectedListId;
    const todoToDeleteFinal = todoToDelete;
    const dateKeyToDeleteFrom = todoToDeleteFinal.startDate ?? selectedDateKey;
    if (user) {
      console.log("TODO: Delete todo from Supabase", todoToDeleteFinal.id);
    }
    setTodosByListId((prevTodos: TodosState) => {
      const listTodos = prevTodos[listId];
      if (!listTodos || !listTodos[dateKeyToDeleteFrom]) return prevTodos;
      const updatedDateTodos = listTodos[dateKeyToDeleteFrom].filter(
        (todo: TodoItem) => todo.id !== todoToDeleteFinal.id
      );
      const updatedListTodos = {
        ...listTodos,
        [dateKeyToDeleteFrom]: updatedDateTodos,
      };
      if (updatedDateTodos.length === 0) {
        delete updatedListTodos[dateKeyToDeleteFrom];
      }
      return { ...prevTodos, [listId]: updatedListTodos };
    });
    closeDeleteTodoModal();
  }, [_selectedListId, todoToDelete, user, selectedDateKey]);

  // Modal open/close handlers (remain mostly the same)
  const openCreateListModal = useCallback(() => {
    setNewListName("");
    setIsCreateListModalOpen(true);
    // Consider focus: createListInputRef.current?.focus();
  }, []);
  const closeCreateListModal = useCallback(() => {
    setIsCreateListModalOpen(false);
    setNewListName("");
  }, []);
  // ... other modal handlers
  const openDeleteListModal = useCallback((id: string) => {
    setListToDeleteId(id);
    setIsDeleteListModalOpen(true);
  }, []);
  const closeDeleteListModal = useCallback(() => {
    setListToDeleteId(null);
    setIsDeleteListModalOpen(false);
  }, []);
  const openDeleteTodoModal = useCallback((todo: TodoItem) => {
    setTodoToDelete(todo);
    setIsDeleteTodoModalOpen(true);
  }, []);
  const handleAddTodoClick = useCallback(
    (date: Date) => {
      if (!_selectedListId) return;
      setSelectedDate(date);
      setAddTodoTargetDate(date);
      setAddTodoTargetRange(null);
      setNewTodoTextForModal("");
      setIsAddTodoModalOpen(true);
      setIsDraggingRange(false);
      setRangeSelectionStart(null);
      setRangeSelectionEndHover(null);
      // Consider focusing input: addTodoModalInputRef.current?.focus();
    },
    [_selectedListId]
  );

  // Calendar handlers (remain the same)
  const handleMonthChange = useCallback((newMonth: Date) => {
    setCurrentMonth(startOfMonth(newMonth));
  }, []);

  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      if (isDraggingRange) {
        setIsDraggingRange(false);
        setRangeSelectionStart(null);
        setRangeSelectionEndHover(null);
      }
    },
    [isDraggingRange]
  );

  const handleRangeSelectStart = useCallback(
    (date: Date) => {
      if (!_selectedListId) return;
      setIsDraggingRange(true);
      setRangeSelectionStart(date);
      setRangeSelectionEndHover(date);
      setSelectedDate(date);
    },
    [_selectedListId]
  );
  const handleRangeHover = useCallback(
    (date: Date | null) => {
      if (isDraggingRange) {
        setRangeSelectionEndHover(date);
      }
    },
    [isDraggingRange]
  );

  const handleDragEnd = useCallback(() => {
    // Add/Remove global mouseup/touchend listeners
  }, [
    isDraggingRange,
    rangeSelectionStart,
    rangeSelectionEndHover,
    _selectedListId,
  ]);
  useEffect(() => {
    // Add/Remove global mouseup/touchend listeners
  }, [handleDragEnd]);

  // --- Return Value ---
  return {
    isLoading,
    lists,
    selectedList,
    todosForSelectedList,
    todosForSelectedDate,
    currentMonth,
    selectedDate,
    isDraggingRange,
    rangeSelectionStart,
    rangeSelectionEndHover,
    isCreateListModalOpen,
    newListName,
    isDeleteListModalOpen,
    listToDeleteId,
    isDeleteTodoModalOpen,
    todoToDelete,
    isAddTodoModalOpen,
    addTodoTargetDate,
    addTodoTargetRange,
    newTodoTextForModal,
    handleSelectList,
    openCreateListModal,
    closeCreateListModal,
    setNewListName,
    confirmCreateList,
    handleRenameList,
    openDeleteListModal,
    closeDeleteListModal,
    confirmDeleteList,
    handleMonthChange,
    handleDateSelect,
    handleAddTodoClick,
    handleRangeSelectStart,
    handleRangeHover,
    closeAddTodoModal,
    setNewTodoTextForModal,
    confirmAddTodoFromModal,
    handleToggleTodo,
    openDeleteTodoModal,
    closeDeleteTodoModal,
    confirmDeleteTodo,
    createListInputRef,
    addTodoModalInputRef,
  };
}

// Helper to format Supabase todos (example)
// function formatTodosFromDb(dbTodos: any[]): TodosState {
//   const state: TodosState = {};
//   for (const todo of dbTodos) {
//     if (!state[todo.list_id]) {
//       state[todo.list_id] = {};
//     }
//     const dateKey = todo.start_date; // Assuming start_date is the key
//     if (!state[todo.list_id][dateKey]) {
//       state[todo.list_id][dateKey] = [];
//     }
//     state[todo.list_id][dateKey].push({
//       id: todo.id,
//       text: todo.text,
//       completed: todo.completed,
//       startDate: todo.start_date,
//       endDate: todo.end_date
//      });
//   }
//   return state;
// }
