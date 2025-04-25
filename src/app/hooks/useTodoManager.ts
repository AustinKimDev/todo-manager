import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListItem, TodoItem, TodosByDate, TodosState } from "../types";
import { generatePastelColor } from "../utils/colors";
import {
  formatDateKey,
  isWithinInterval,
  parseDateKey,
  startOfMonth,
} from "../utils/date-helpers";

// --- Initial Data (Moved here for encapsulation) ---
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

export function useTodoManager() {
  // --- State Declarations ---
  const [isLoading, setIsLoading] = useState(true);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
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

  // Refs for modal inputs (These should probably live within the modal or parent component rendering the modal)
  // We'll pass focus functions instead.
  const createListInputRef = useRef<HTMLInputElement>(null);
  const addTodoModalInputRef = useRef<HTMLInputElement>(null);

  // --- LocalStorage Load/Save Effects ---
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedListsRaw = localStorage.getItem("todoAppLists");
      const savedTodosRaw = localStorage.getItem("todoAppTodos");
      const lastSelectedId = localStorage.getItem("todoAppLastSelectedListId");

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
        setSelectedListId(lastSelectedId);
      } else if (loadedLists.length > 0) {
        setSelectedListId(loadedLists[0].id);
      } else {
        setSelectedListId(null);
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      setLists(defaultLists);
      setTodosByListId(initialTodos);
      setSelectedListId(defaultLists.length > 0 ? defaultLists[0].id : null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("todoAppLists", JSON.stringify(lists));
      } catch (error) {
        console.error("Error saving lists to localStorage:", error);
      }
    }
  }, [lists, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("todoAppTodos", JSON.stringify(todosByListId));
      } catch (error) {
        console.error("Error saving todos to localStorage:", error);
      }
    }
  }, [todosByListId, isLoading]);

  useEffect(() => {
    if (!isLoading && selectedListId) {
      try {
        localStorage.setItem("todoAppLastSelectedListId", selectedListId);
      } catch (error) {
        console.error("Error saving last selected list ID:", error);
      }
    } else if (!isLoading && !selectedListId) {
      localStorage.removeItem("todoAppLastSelectedListId");
    }
  }, [selectedListId, isLoading]);

  // --- Derived State ---
  const selectedList = useMemo(
    () => lists.find((list) => list.id === selectedListId),
    [lists, selectedListId]
  );
  const todosForSelectedList = useMemo(
    () => (selectedListId ? todosByListId[selectedListId] || {} : {}),
    [selectedListId, todosByListId]
  );
  const selectedDateKey = useMemo(
    () => formatDateKey(selectedDate),
    [selectedDate]
  );

  const todosForSelectedDate = useMemo(() => {
    if (!selectedListId) return [];
    const listTodos = todosByListId[selectedListId] || {};
    const dateTodos: TodoItem[] = [];
    const addedTodoIds = new Set<string>();

    Object.entries(listTodos).forEach(([dateKey, todosOnDate]) => {
      if (Array.isArray(todosOnDate)) {
        (todosOnDate as TodoItem[]).forEach((todo: TodoItem) => {
          if (addedTodoIds.has(todo.id)) return;
          if (dateKey === selectedDateKey && !todo.endDate) {
            dateTodos.push(todo);
            addedTodoIds.add(todo.id);
          } else if (todo.startDate && todo.endDate) {
            const startDate = parseDateKey(todo.startDate);
            const endDate = parseDateKey(todo.endDate);
            if (isWithinInterval(selectedDate, startDate, endDate)) {
              dateTodos.push(todo);
              addedTodoIds.add(todo.id);
            }
          }
        });
      }
    });
    dateTodos.sort((a, b) => (!!a.endDate ? 1 : -1) - (!!b.endDate ? 1 : -1));
    return dateTodos;
  }, [selectedListId, selectedDate, todosByListId, selectedDateKey]);

  // --- Handlers ---

  // List Management
  const handleSelectList = useCallback((id: string) => {
    setSelectedListId(id);
    setRangeSelectionStart(null);
    setIsDraggingRange(false);
    setRangeSelectionEndHover(null);
  }, []);

  const openCreateListModal = useCallback(() => {
    setNewListName("");
    setIsCreateListModalOpen(true);
  }, []);

  const closeCreateListModal = useCallback(
    () => setIsCreateListModalOpen(false),
    []
  );

  const confirmCreateList = useCallback(() => {
    const trimmedName = newListName.trim();
    if (trimmedName !== "") {
      const newListId = Date.now().toString();
      const newList: ListItem = { id: newListId, name: trimmedName };
      setLists((prevLists) => [...prevLists, newList]);
      setTodosByListId((prevTodos: TodosState) => ({
        ...prevTodos,
        [newListId]: {},
      }));
      setSelectedListId(newListId);
      closeCreateListModal();
    } else {
      alert("List name cannot be empty.");
    }
  }, [newListName, closeCreateListModal]);

  const handleRenameList = useCallback((id: string, newName: string) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === id ? { ...list, name: newName } : list
      )
    );
  }, []);

  const openDeleteListModal = useCallback((id: string) => {
    setListToDeleteId(id);
    setIsDeleteListModalOpen(true);
  }, []);

  const closeDeleteListModal = useCallback(() => {
    setListToDeleteId(null);
    setIsDeleteListModalOpen(false);
  }, []);

  const confirmDeleteList = useCallback(() => {
    if (listToDeleteId) {
      const listId = listToDeleteId;
      let newSelectedListId = selectedListId; // Store current selection

      // Filter lists first
      const remainingLists = lists.filter((list) => list.id !== listId);
      setLists(remainingLists); // Update lists state

      // Determine new selected ID if the deleted one was active
      if (selectedListId === listId) {
        newSelectedListId =
          remainingLists.length > 0 ? remainingLists[0].id : null;
      }

      // Update todos state *after* list state and selection logic
      setTodosByListId((prevTodos: TodosState) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [listId]: _, ...remainingTodos } = prevTodos;
        return remainingTodos;
      });

      // Update selected ID state if it changed
      if (selectedListId === listId) {
        setSelectedListId(newSelectedListId);
      }

      closeDeleteListModal();
    }
  }, [listToDeleteId, selectedListId, lists, closeDeleteListModal]); // Keep lists dependency

  // Calendar Interaction
  const handleMonthChange = useCallback((newMonth: Date) => {
    setCurrentMonth(newMonth);
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

  const handleAddTodoClick = useCallback(
    (date: Date) => {
      if (!selectedListId) return;
      setSelectedDate(date);
      setAddTodoTargetDate(date);
      setAddTodoTargetRange(null);
      setNewTodoTextForModal("");
      setIsAddTodoModalOpen(true);
      setIsDraggingRange(false);
      setRangeSelectionStart(null);
      setRangeSelectionEndHover(null);
    },
    [selectedListId]
  );

  const handleRangeSelectStart = useCallback(
    (date: Date) => {
      if (!selectedListId) return;
      setIsDraggingRange(true);
      setRangeSelectionStart(date);
      setRangeSelectionEndHover(date);
      setSelectedDate(date);
    },
    [selectedListId]
  );

  const handleRangeHover = useCallback(
    (date: Date) => {
      if (isDraggingRange) {
        setRangeSelectionEndHover(date);
      }
    },
    [isDraggingRange]
  );

  const handleDragEnd = useCallback(() => {
    if (
      isDraggingRange &&
      rangeSelectionStart &&
      rangeSelectionEndHover &&
      selectedListId
    ) {
      const startDate =
        rangeSelectionStart <= rangeSelectionEndHover
          ? rangeSelectionStart
          : rangeSelectionEndHover;
      const finalEndDate =
        rangeSelectionStart <= rangeSelectionEndHover
          ? rangeSelectionEndHover
          : rangeSelectionStart;
      setAddTodoTargetRange({ start: startDate, end: finalEndDate });
      setAddTodoTargetDate(null);
      setNewTodoTextForModal("");
      setIsAddTodoModalOpen(true);
      setSelectedDate(finalEndDate);
    }
    setIsDraggingRange(false);
    setRangeSelectionStart(null);
    setRangeSelectionEndHover(null);
  }, [
    isDraggingRange,
    rangeSelectionStart,
    rangeSelectionEndHover,
    selectedListId,
  ]);

  useEffect(() => {
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchend", handleDragEnd);
    return () => {
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [handleDragEnd]);

  // Todo Management
  const closeAddTodoModal = useCallback(() => {
    setIsAddTodoModalOpen(false);
    setAddTodoTargetDate(null);
    setAddTodoTargetRange(null);
    setNewTodoTextForModal("");
  }, []);

  const confirmAddTodoFromModal = useCallback(() => {
    const text = newTodoTextForModal.trim();
    if (text === "" || !selectedListId) {
      alert("Todo text cannot be empty.");
      return;
    }

    const newTodoBase: Omit<TodoItem, "id"> = { text, completed: false };
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
      setTodosByListId((prevTodos: TodosState) => {
        const updatedListTodos = { ...(prevTodos[selectedListId!] || {}) };
        const dateTodos = updatedListTodos[keyForTodo] || [];
        updatedListTodos[keyForTodo] = [...dateTodos, todoToAdd];
        return { ...prevTodos, [selectedListId!]: updatedListTodos };
      });
    }

    closeAddTodoModal();
  }, [
    newTodoTextForModal,
    selectedListId,
    addTodoTargetDate,
    addTodoTargetRange,
    closeAddTodoModal,
  ]);

  const handleToggleTodo = useCallback(
    (todoId: string) => {
      if (!selectedListId) return;
      let dateKeyToUpdate: string | null = null;
      let todoToUpdate: TodoItem | null = null;

      const listTodos = todosByListId[selectedListId] || {};
      outerLoop: for (const key in listTodos) {
        if (Array.isArray(listTodos[key])) {
          for (const todo of listTodos[key] as TodoItem[]) {
            if (todo.id === todoId) {
              todoToUpdate = todo;
              dateKeyToUpdate = key;
              break outerLoop;
            }
          }
        }
      }

      if (!todoToUpdate || !dateKeyToUpdate) return;

      const allowToggle =
        !todoToUpdate.endDate || dateKeyToUpdate === selectedDateKey;

      if (allowToggle) {
        const key = dateKeyToUpdate;
        setTodosByListId((prevTodos: TodosState) => {
          const currentListTodos = prevTodos[selectedListId!];
          if (!currentListTodos || !currentListTodos[key]) return prevTodos;
          const updatedDateTodos = currentListTodos[key].map((t: TodoItem) =>
            t.id === todoId ? { ...t, completed: !t.completed } : t
          );
          return {
            ...prevTodos,
            [selectedListId!]: { ...currentListTodos, [key]: updatedDateTodos },
          };
        });
      } else {
        alert(
          "Range todos can only be marked complete/incomplete from their start date."
        );
      }
    },
    [selectedListId, todosByListId, selectedDateKey]
  );

  const openDeleteTodoModal = useCallback((todo: TodoItem) => {
    setTodoToDelete(todo);
    setIsDeleteTodoModalOpen(true);
  }, []);

  const closeDeleteTodoModal = useCallback(() => {
    setTodoToDelete(null);
    setIsDeleteTodoModalOpen(false);
  }, []);

  const confirmDeleteTodo = useCallback(() => {
    if (!selectedListId || !todoToDelete) return;
    const todoToDeleteFinal = todoToDelete;
    const dateKeyToDeleteFrom =
      todoToDeleteFinal.startDate ?? formatDateKey(selectedDate);

    setTodosByListId((prevTodos: TodosState) => {
      const listTodos = prevTodos[selectedListId!];
      if (!listTodos || !listTodos[dateKeyToDeleteFrom]) {
        console.warn(
          `Todo list or date key ${dateKeyToDeleteFrom} not found for deletion.`
        );
        return prevTodos;
      }
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
      return { ...prevTodos, [selectedListId!]: updatedListTodos };
    });
    closeDeleteTodoModal();
  }, [selectedListId, todoToDelete, selectedDate, closeDeleteTodoModal]);

  return {
    isLoading,
    lists,
    selectedListId,
    selectedList,
    todosByListId,
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
