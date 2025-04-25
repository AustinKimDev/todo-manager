"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
// --- Date Library (date-fns) ---
// Use a library like date-fns in a real project!
// import { format, parse, startOfMonth, ... , isWithinInterval, eachDayOfInterval as dateFnsEachDay } from 'date-fns';

// --- Helper Functions (Simulating date-fns) ---
const formatDateKey = (date: Date): string => {
  /* ... (same as before) ... */
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);
const startOfWeek = (date: Date): Date => {
  /* ... (same as before) ... */
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek;
  return new Date(new Date(date).setDate(diff));
};
const endOfWeek = (date: Date): Date => {
  /* ... (same as before) ... */
  const dayOfWeek = date.getDay();
  const diff = date.getDate() + (6 - dayOfWeek);
  return new Date(new Date(date).setDate(diff));
};
const eachDayOfInterval = (start: Date, end: Date): Date[] => {
  /* ... (same as before, ensures start <= end) ... */
  const dates: Date[] = [];
  let currentDate = new Date(start);
  currentDate.setHours(0, 0, 0, 0);
  let finalDate = new Date(end);
  finalDate.setHours(0, 0, 0, 0);
  // Swap if start is after end
  if (currentDate > finalDate) {
    [currentDate, finalDate] = [finalDate, currentDate];
  }
  while (currentDate <= finalDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};
const addMonths = (date: Date, amount: number): Date => {
  /* ... (same as before) ... */
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + amount);
  return newDate;
};
const subMonths = (date: Date, amount: number): Date => {
  /* ... (same as before) ... */
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - amount);
  return newDate;
};
const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  /* ... (same as before) ... */
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
const isSameMonth = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth();
const isWithinInterval = (
  date: Date,
  start: Date | null,
  end: Date | null
): boolean => {
  // Updated for potential nulls and correct order
  if (!start || !end) return false;
  const time = new Date(date).setHours(0, 0, 0, 0);
  let startTime = new Date(start).setHours(0, 0, 0, 0);
  let endTime = new Date(end).setHours(0, 0, 0, 0);
  // Ensure start <= end
  if (startTime > endTime) {
    [startTime, endTime] = [endTime, startTime];
  }
  return time >= startTime && time <= endTime;
};
const parseDateKey = (dateKey: string): Date => {
  /* ... (same as before) ... */
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// --- Interfaces ---
interface ListItem {
  id: string;
  name: string;
}
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}
interface TodosByDate {
  [dateKey: string]: TodoItem[];
}
interface TodosState {
  [listId: string]: TodosByDate;
}
interface ModalProps {
  /* ... (same as before) ... */ isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}
interface ListManagerDropdownProps {}

// --- Initial Data (Used as fallback) ---
const defaultLists: ListItem[] = [
  /* ... (same as before) ... */ { id: "1", name: "Work" },
  { id: "2", name: "Home" },
  { id: "3", name: "Study" },
];
const todayKey = formatDateKey(new Date());
const initialTodos: TodosState = {
  /* ... (same as before) ... */ "1": {
    [todayKey]: [{ id: "t1", text: "Team meeting", completed: false }],
  },
  "2": { [todayKey]: [{ id: "t2", text: "Clean kitchen", completed: true }] },
  "3": {},
};

// --- Components ---

// Reusable Modal Component (Styled for Glassmorphism)
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400",
}) => {
  if (!isOpen) return null;
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    // Backdrop with blur
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Modal Panel with glass effect */}
      <div
        className="bg-gray-700/60 backdrop-blur-lg border border-gray-500/30 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 text-gray-100 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold leading-6 text-white mb-4">
          {title}
        </h3>
        <div className="mt-2 text-sm text-gray-200">{children}</div>
        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-gray-500/50 bg-gray-600/50 px-4 py-2 text-sm font-medium text-gray-200 shadow-sm hover:bg-gray-500/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-gray-400"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Calendar View Component (Styled & Interaction Update)
interface CalendarViewProps {
  currentMonth: Date;
  selectedDate: Date;
  todosForMonth: TodosByDate;
  rangeSelectionStart: Date | null;
  rangeSelectionEndHover: Date | null; // For visual feedback during drag
  isDraggingRange: boolean;
  onDateSelect: (date: Date) => void; // Click on cell background
  onAddTodoClick: (date: Date) => void; // Click on date number button
  onMonthChange: (newMonth: Date) => void;
  onRangeSelectStart: (date: Date) => void; // MouseDown on date number button
  onRangeSelectEnd: (date: Date) => void; // MouseUp after drag
  onRangeHover: (date: Date) => void; // MouseEnter date number button during drag
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  selectedDate,
  todosForMonth,
  rangeSelectionStart,
  rangeSelectionEndHover, // Use this for visual highlight during drag
  isDraggingRange,
  onDateSelect, // Click cell background
  onAddTodoClick, // Click date number
  onMonthChange,
  onRangeSelectStart, // Mousedown on date number
  onRangeSelectEnd, // Mouseup anywhere
  onRangeHover, // Mouseenter date number
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval(startDate, endDate);
  const today = new Date();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleCellClick = (day: Date) => {
    if (!isSameMonth(day, currentMonth)) return;
    onDateSelect(day); // Select date when clicking cell background
  };

  const handleDateNumberMouseDown = (
    event: React.MouseEvent<HTMLButtonElement>,
    day: Date
  ) => {
    if (!isSameMonth(day, currentMonth)) return;
    event.stopPropagation(); // Prevent cell click from firing
    onRangeSelectStart(day); // Signal potential drag start
  };

  const handleDateNumberClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    day: Date
  ) => {
    if (!isSameMonth(day, currentMonth)) return;
    event.stopPropagation(); // Prevent cell click
    // Only trigger add todo if not dragging (mouseup will handle range add)
    if (!isDraggingRange) {
      onAddTodoClick(day);
    }
    // Note: The actual range end is handled by onMouseUp in the App component
  };

  const handleDateNumberMouseEnter = (day: Date) => {
    if (isDraggingRange && isSameMonth(day, currentMonth)) {
      onRangeHover(day);
    }
  };

  return (
    // Darker background, subtle border
    <div className="bg-gray-800/70 backdrop-blur-md border border-gray-500/20 p-4 rounded-xl shadow-lg text-gray-200">
      {/* Header: Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="p-2 rounded-full text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-white">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="p-2 rounded-full text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-600/30 border border-gray-600/30 rounded-md overflow-hidden">
        {days.map((day, index) => {
          const dayKey = formatDateKey(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelectedDate = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const hasTodos =
            isCurrentMonth &&
            todosForMonth[dayKey] &&
            todosForMonth[dayKey].length > 0;

          // Determine if the day is part of the selection range (start, end, or in between)
          const isInRange =
            isDraggingRange &&
            isWithinInterval(day, rangeSelectionStart, rangeSelectionEndHover);
          const isRangeStart = isSameDay(day, rangeSelectionStart);
          const isRangeEndHover = isSameDay(day, rangeSelectionEndHover);

          return (
            // Cell container: Handles background click for date selection
            <div
              key={index}
              onClick={() => handleCellClick(day)}
              className={`relative min-h-[7rem] p-1 transition-colors duration-100 cursor-pointer group
                                ${
                                  !isCurrentMonth
                                    ? "bg-gray-700/40"
                                    : "bg-gray-800/50 hover:bg-gray-700/60"
                                }
                                ${isInRange ? "bg-indigo-700/40" : ""}
                                ${
                                  isSelectedDate && !isInRange
                                    ? "bg-indigo-900/50"
                                    : ""
                                }
                            `}
            >
              {/* Date Number Button: Handles Add Todo click and Drag start/hover */}
              <button
                onMouseDown={(e) => handleDateNumberMouseDown(e, day)}
                onClick={(e) => handleDateNumberClick(e, day)}
                onMouseEnter={() => handleDateNumberMouseEnter(day)} // Track hover during drag
                disabled={!isCurrentMonth}
                className={`
                                    absolute top-1.5 right-1.5 p-1 h-7 w-7 text-xs rounded-full flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-gray-800 focus:ring-indigo-400 z-10 transition-colors duration-150
                                    ${
                                      isCurrentMonth
                                        ? "text-gray-200 hover:bg-gray-600/80"
                                        : "text-gray-500 cursor-not-allowed"
                                    }
                                    ${
                                      isRangeStart
                                        ? "bg-yellow-500 text-yellow-900 font-semibold ring-2 ring-yellow-400"
                                        : ""
                                    }
                                    ${
                                      isInRange && !isRangeStart
                                        ? "bg-indigo-500/80 text-white"
                                        : ""
                                    }
                                    ${
                                      !isInRange && isSelectedDate
                                        ? "bg-indigo-600 text-white font-semibold"
                                        : ""
                                    }
                                    ${
                                      !isInRange && !isSelectedDate && isToday
                                        ? "bg-blue-500/50 text-blue-100 font-semibold"
                                        : ""
                                    }
                                `}
                title={
                  isCurrentMonth
                    ? isRangeStart
                      ? "Drag to end date"
                      : "Click to add todo, Click & Drag to add to range"
                    : ""
                }
              >
                {day.getDate()}
              </button>
              {/* Dot indicator for todos */}
              {isCurrentMonth && hasTodos && (
                <span
                  className={`absolute top-2 left-2 h-1.5 w-1.5 rounded-full ${
                    isInRange
                      ? "bg-white/80"
                      : isSelectedDate
                      ? "bg-indigo-200"
                      : "bg-blue-400"
                  }`}
                  title="Has todos"
                ></span>
              )}
              {/* Display Todos Preview in Cell (Optional Enhancement) */}
              {isCurrentMonth &&
                todosForMonth[dayKey] &&
                todosForMonth[dayKey].length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 space-y-0.5 max-h-[4.5rem] overflow-hidden text-[10px] pointer-events-none">
                    {todosForMonth[dayKey].slice(0, 4).map((todo) => (
                      <div
                        key={todo.id}
                        className={`px-1 rounded-sm truncate ${
                          todo.completed
                            ? "text-gray-400 line-through"
                            : "text-gray-200"
                        } ${isInRange ? "bg-white/10" : "bg-gray-700/40"}`}
                      >
                        {todo.text}
                      </div>
                    ))}
                    {todosForMonth[dayKey].length > 4 && (
                      <div className="text-center text-gray-400">...</div>
                    )}
                  </div>
                )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Click number to add todo. Click & Drag between numbers to add todo to
        range. Click cell background to view day's todos.
      </p>
    </div>
  );
};

// The main App component
const App: React.FC<ListManagerDropdownProps> = () => {
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);

  // State for lists - Start empty, load from localStorage or use default
  const [lists, setLists] = useState<ListItem[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>("");

  // State for todos - Start empty, load from localStorage or use initial
  const [todosByListId, setTodosByListId] = useState<TodosState>({});

  // State for Calendar and selected date
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(new Date())
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // State for range selection (Drag and Drop)
  const [isDraggingRange, setIsDraggingRange] = useState<boolean>(false);
  const [rangeSelectionStart, setRangeSelectionStart] = useState<Date | null>(
    null
  );
  const [rangeSelectionEndHover, setRangeSelectionEndHover] =
    useState<Date | null>(null);

  // State for Add Todo Modal
  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState<boolean>(false);
  const [addTodoTargetDate, setAddTodoTargetDate] = useState<Date | null>(null);
  const [addTodoTargetRange, setAddTodoTargetRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [newTodoTextForModal, setNewTodoTextForModal] = useState<string>("");

  // Other Modal States (List/Todo Deletion)
  const [isCreateListModalOpen, setIsCreateListModalOpen] =
    useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>("");
  const [isDeleteListModalOpen, setIsDeleteListModalOpen] =
    useState<boolean>(false);
  const [isDeleteTodoModalOpen, setIsDeleteTodoModalOpen] =
    useState<boolean>(false);
  const [todoToDelete, setTodoToDelete] = useState<TodoItem | null>(null);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);
  const addTodoModalInputRef = useRef<HTMLInputElement>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // --- LocalStorage Load Effect ---
  useEffect(() => {
    setIsLoading(true); // Start loading
    try {
      const savedListsRaw = localStorage.getItem("todoAppLists");
      const savedTodosRaw = localStorage.getItem("todoAppTodos");
      const lastSelectedId = localStorage.getItem("todoAppLastSelectedListId");

      let loadedLists = defaultLists;
      let loadedTodos = initialTodos;

      if (savedListsRaw) {
        try {
          const parsedLists = JSON.parse(savedListsRaw);
          if (Array.isArray(parsedLists)) {
            // Basic validation
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
            // Basic validation
            loadedTodos = parsedTodos;
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

      // Set initial selected list ID
      if (
        lastSelectedId &&
        loadedLists.some((list) => list.id === lastSelectedId)
      ) {
        setSelectedListId(lastSelectedId);
      } else if (loadedLists.length > 0) {
        setSelectedListId(loadedLists[0].id); // Fallback to the first list
      } else {
        setSelectedListId(null); // No lists available
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      // Fallback to initial defaults in case of any major error
      setLists(defaultLists);
      setTodosByListId(initialTodos);
      setSelectedListId(defaultLists.length > 0 ? defaultLists[0].id : null);
    } finally {
      setIsLoading(false); // Finish loading
    }
  }, []); // Empty dependency array: runs only once on mount

  // --- LocalStorage Save Effects ---
  useEffect(() => {
    if (!isLoading) {
      // Only save after initial load is complete
      try {
        localStorage.setItem("todoAppLists", JSON.stringify(lists));
      } catch (error) {
        console.error("Error saving lists to localStorage:", error);
      }
    }
  }, [lists, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      // Only save after initial load is complete
      try {
        localStorage.setItem("todoAppTodos", JSON.stringify(todosByListId));
      } catch (error) {
        console.error("Error saving todos to localStorage:", error);
      }
    }
  }, [todosByListId, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      // Only save after initial load is complete
      if (selectedListId) {
        try {
          localStorage.setItem("todoAppLastSelectedListId", selectedListId);
        } catch (error) {
          console.error(
            "Error saving last selected list ID to localStorage:",
            error
          );
        }
      } else {
        // If no list is selected (e.g., all lists deleted), remove the item
        localStorage.removeItem("todoAppLastSelectedListId");
      }
    }
  }, [selectedListId, isLoading]);

  // Derived State
  const selectedList = lists.find((list) => list.id === selectedListId);
  const todosForSelectedList = selectedListId
    ? todosByListId[selectedListId] || {}
    : {};
  const selectedDateKey = formatDateKey(selectedDate);
  const todosForSelectedDate = todosForSelectedList[selectedDateKey] || [];

  // --- Event Handlers ---
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isDropdownOpen) setIsRenaming(false);
  };
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      /* ... (same as before) ... */ if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".fixed.inset-0.z-50")
      ) {
        setIsDropdownOpen(false);
        setIsRenaming(false);
      }
    },
    [setIsDropdownOpen, setIsRenaming]
  );
  useEffect(() => {
    /* ... (same as before) ... */ if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, handleClickOutside]);

  // --- List Management Logic (Unchanged) ---
  const handleSelectList = (id: string) => {
    setSelectedListId(id);
    setIsDropdownOpen(false);
    setIsRenaming(false);
    setRangeSelectionStart(null);
    setIsDraggingRange(false);
  };
  const openCreateListModal = () => {
    /* ... */ setNewListName("");
    setIsCreateListModalOpen(true);
    setIsDropdownOpen(false);
    setTimeout(() => createInputRef.current?.focus(), 100);
  };
  const closeCreateListModal = () => setIsCreateListModalOpen(false);
  const confirmCreateList = () => {
    /* ... */ const trimmedName = newListName.trim();
    if (trimmedName !== "") {
      const newListId = Date.now().toString();
      const newList: ListItem = { id: newListId, name: trimmedName };
      setLists([...lists, newList]);
      setTodosByListId((prevTodos) => ({ ...prevTodos, [newListId]: {} }));
      setSelectedListId(newListId); // Automatically select the new list
      closeCreateListModal();
    } else {
      alert("List name cannot be empty.");
    }
  };
  const handleRenameList = () => {
    /* ... */ if (selectedList) {
      setRenameValue(selectedList.name);
      setIsRenaming(true);
    }
  };
  const confirmRename = () => {
    /* ... */ const trimmedName = renameValue.trim();
    if (selectedListId && trimmedName !== "") {
      setLists(
        lists.map((list) =>
          list.id === selectedListId ? { ...list, name: trimmedName } : list
        )
      );
      setIsRenaming(false);
      setIsDropdownOpen(false);
    } else if (trimmedName === "") {
      alert("List name cannot be empty.");
    }
  };
  const openDeleteListModal = () => {
    /* ... */ if (selectedListId) {
      setIsDeleteListModalOpen(true);
      setIsDropdownOpen(false);
    }
  };
  const closeDeleteListModal = () => setIsDeleteListModalOpen(false);
  const confirmDeleteList = () => {
    /* ... */ if (selectedListId) {
      const remainingLists = lists.filter((list) => list.id !== selectedListId);
      setLists(remainingLists); // Update lists state
      const { [selectedListId]: _, ...remainingTodos } = todosByListId;
      setTodosByListId(remainingTodos); // Update todos state
      // Select the first remaining list or null if no lists left
      setSelectedListId(
        remainingLists.length > 0 ? remainingLists[0].id : null
      );
      closeDeleteListModal();
      setIsRenaming(false); // Close rename input if it was open
    }
  };

  // --- Calendar Interaction & Todo Adding ---
  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  // Click on cell background - Selects the date for viewing details
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // If a drag was in progress but didn't end on a date number, cancel it
    if (isDraggingRange) {
      setIsDraggingRange(false);
      setRangeSelectionStart(null);
      setRangeSelectionEndHover(null);
    }
  };

  // Click on date number - Opens modal for single date add
  const handleAddTodoClick = (date: Date) => {
    setSelectedDate(date); // Also select the date when adding
    setAddTodoTargetDate(date);
    setAddTodoTargetRange(null);
    setNewTodoTextForModal("");
    setIsAddTodoModalOpen(true);
    // Ensure drag state is reset if a single click happens
    setIsDraggingRange(false);
    setRangeSelectionStart(null);
    setRangeSelectionEndHover(null);
    setTimeout(() => addTodoModalInputRef.current?.focus(), 100);
  };

  // MouseDown on date number - Starts potential drag
  const handleRangeSelectStart = (date: Date) => {
    setIsDraggingRange(true);
    setRangeSelectionStart(date);
    setRangeSelectionEndHover(date); // Initially hover ends where it starts
    setSelectedDate(date); // Select start date visually
  };

  // MouseEnter date number - Updates hover state during drag
  const handleRangeHover = (date: Date) => {
    if (isDraggingRange) {
      setRangeSelectionEndHover(date);
    }
  };

  // MouseUp anywhere - Ends drag, potentially opens range modal
  const handleMouseUp = useCallback(() => {
    // Wrap in useCallback if dependencies are stable
    if (
      isDraggingRange &&
      rangeSelectionStart &&
      rangeSelectionEndHover &&
      selectedListId
    ) {
      // Ensure start <= end
      const startDate =
        rangeSelectionStart <= rangeSelectionEndHover // Use <= for single day drag
          ? rangeSelectionStart
          : rangeSelectionEndHover;
      const finalEndDate =
        rangeSelectionStart <= rangeSelectionEndHover
          ? rangeSelectionEndHover
          : rangeSelectionStart;

      // Open modal even for single day range from drag
      setAddTodoTargetRange({ start: startDate, end: finalEndDate });
      setAddTodoTargetDate(null);
      setNewTodoTextForModal("");
      setIsAddTodoModalOpen(true);
      setTimeout(() => addTodoModalInputRef.current?.focus(), 100);

      // Select the end date of the range after adding
      setSelectedDate(finalEndDate);
    }
    // Always reset drag state on mouse up
    setIsDraggingRange(false);
    setRangeSelectionStart(null);
    setRangeSelectionEndHover(null);
  }, [
    isDraggingRange,
    rangeSelectionStart,
    rangeSelectionEndHover,
    selectedListId,
  ]); // Add dependencies

  // Effect to add mouseup listener to the window
  useEffect(() => {
    // Add listener when component mounts
    window.addEventListener("mouseup", handleMouseUp);

    // Cleanup listener when component unmounts
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseUp]); // Add handleMouseUp as dependency

  // --- Add/Manage Todos ---
  const closeAddTodoModal = () => {
    /* ... (same as before) ... */ setIsAddTodoModalOpen(false);
    setAddTodoTargetDate(null);
    setAddTodoTargetRange(null);
    setNewTodoTextForModal("");
  };
  const confirmAddTodoFromModal = () => {
    /* ... (same logic as before for single/range add) ... */
    const text = newTodoTextForModal.trim();
    if (text === "" || !selectedListId) {
      alert("Todo text cannot be empty.");
      return;
    }
    const newTodoBase: Omit<TodoItem, "id"> = { text, completed: false };
    if (addTodoTargetDate) {
      const dateKey = formatDateKey(addTodoTargetDate);
      const newTodo: TodoItem = { ...newTodoBase, id: `t-${Date.now()}` };
      setTodosByListId((prevTodos) => {
        const listTodos = prevTodos[selectedListId] || {};
        const dateTodos = listTodos[dateKey] || [];
        return {
          ...prevTodos,
          [selectedListId]: {
            ...listTodos,
            [dateKey]: [...dateTodos, newTodo],
          },
        };
      });
    } else if (addTodoTargetRange) {
      const datesInRange = eachDayOfInterval(
        addTodoTargetRange.start,
        addTodoTargetRange.end
      );
      setTodosByListId((prevTodos) => {
        const updatedListTodos = { ...(prevTodos[selectedListId] || {}) };
        datesInRange.forEach((date) => {
          // Only add if the date is within the current month view for consistency? No, add to all dates.
          const dateKey = formatDateKey(date);
          const dateTodos = updatedListTodos[dateKey] || [];
          const newTodo: TodoItem = {
            ...newTodoBase,
            id: `t-${dateKey}-${Date.now()}-${Math.random()}`, // More unique ID for range adds
          };
          updatedListTodos[dateKey] = [...dateTodos, newTodo];
        });
        return { ...prevTodos, [selectedListId]: updatedListTodos };
      });
    }
    closeAddTodoModal();
  };
  const handleToggleTodo = (todoId: string) => {
    /* ... (same as before) ... */ if (!selectedListId) return;
    const dateKey = formatDateKey(selectedDate);
    setTodosByListId((prevTodos) => {
      const listTodos = prevTodos[selectedListId];
      if (!listTodos || !listTodos[dateKey]) return prevTodos; // Check if date exists
      const updatedDateTodos = listTodos[dateKey].map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      );
      return {
        ...prevTodos,
        [selectedListId]: { ...listTodos, [dateKey]: updatedDateTodos },
      };
    });
  };
  const openDeleteTodoModal = (todo: TodoItem) => {
    /* ... */ setTodoToDelete(todo);
    setIsDeleteTodoModalOpen(true);
  };
  const closeDeleteTodoModal = () => {
    /* ... */ setTodoToDelete(null);
    setIsDeleteTodoModalOpen(false);
  };
  const confirmDeleteTodo = () => {
    /* ... (same as before) ... */ if (!selectedListId || !todoToDelete) return;
    const dateKey = formatDateKey(selectedDate);
    setTodosByListId((prevTodos) => {
      const listTodos = prevTodos[selectedListId];
      // Ensure the list and date exist before trying to filter
      if (!listTodos || !listTodos[dateKey]) return prevTodos;

      const updatedDateTodos = listTodos[dateKey].filter(
        (todo) => todo.id !== todoToDelete.id
      );
      const updatedListTodos = { ...listTodos, [dateKey]: updatedDateTodos };
      // Clean up the date key if no todos remain for that date
      if (updatedDateTodos.length === 0) {
        delete updatedListTodos[dateKey];
      }
      // Return the updated state structure
      return { ...prevTodos, [selectedListId]: updatedListTodos };
    });
    closeDeleteTodoModal();
  };

  // --- Render Logic ---

  // Loading Indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
        <p className="text-white text-xl animate-pulse">Loading Planner...</p>
      </div>
    );
  }

  return (
    // Dark background for the whole page
    <div
      className="flex justify-center items-start pt-10 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 font-sans"
      ref={calendarContainerRef} // Keep ref for potential future use, though mouseup is on window now
    >
      <div className="w-full max-w-4xl px-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-white/90">
          My Planner
        </h1>

        {/* List Selection Dropdown (Styled) */}
        <div className="relative mb-6 max-w-sm mx-auto" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            disabled={isLoading} // Disable while loading
            className="w-full bg-gray-700/60 backdrop-blur-md border border-gray-500/30 text-gray-200 rounded-lg shadow-md px-4 py-2.5 inline-flex justify-between items-center text-sm font-medium hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <span className="truncate pr-2">
              {selectedList
                ? selectedList.name
                : lists.length > 0
                ? "Select a List"
                : "No lists available"}
            </span>
            <svg
              className={`flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? "transform rotate-180" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {/* Dropdown Menu (Styled) */}
          {isDropdownOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-full rounded-lg shadow-xl bg-gray-700/80 backdrop-blur-lg border border-gray-500/30 ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
              role="menu"
              aria-orientation="vertical"
            >
              <div className="py-1 max-h-60 overflow-y-auto" role="none">
                {isRenaming && selectedList ? (
                  <div className="px-4 py-2 flex items-center space-x-2 border-b border-gray-600/50">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmRename();
                        if (e.key === "Escape") setIsRenaming(false);
                      }}
                      className="flex-grow px-2 py-1 bg-gray-600/70 border border-gray-500/50 rounded-md text-sm text-gray-100 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={confirmRename}
                      className="p-1 text-green-400 hover:text-green-300 focus:outline-none rounded"
                      title="Confirm Rename"
                    >
                      {/* Check Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsRenaming(false)}
                      className="p-1 text-red-400 hover:text-red-300 focus:outline-none rounded"
                      title="Cancel Rename"
                    >
                      {/* X Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    {lists.length > 0 ? (
                      lists.map((list) => (
                        <button
                          key={list.id}
                          onClick={() => handleSelectList(list.id)}
                          className={`${
                            list.id === selectedListId
                              ? "bg-indigo-600/40 text-white" // Use Tailwind semantic colors
                              : "text-gray-200"
                          } block w-full text-left px-4 py-2 text-sm hover:bg-gray-600/60 truncate rounded mx-1 my-0.5`}
                          role="menuitem"
                          title={list.name}
                        >
                          {list.name}
                        </button>
                      ))
                    ) : (
                      <span className="block px-4 py-2 text-sm text-gray-400 italic">
                        No lists yet.
                      </span>
                    )}
                    {/* Separator */}
                    {(lists.length > 0 || selectedList) && (
                      <div className="border-t border-gray-600/50 my-1 mx-1"></div>
                    )}
                    {/* Actions */}
                    <button
                      onClick={openCreateListModal}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600/60 rounded mx-1 my-0.5"
                      role="menuitem"
                    >
                      Create New List...
                    </button>
                    {selectedList && (
                      <>
                        <button
                          onClick={handleRenameList}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600/60 rounded mx-1 my-0.5"
                          role="menuitem"
                        >
                          Rename List...
                        </button>
                        <button
                          onClick={openDeleteListModal}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600/40 hover:text-red-200 rounded mx-1 my-0.5"
                          role="menuitem"
                        >
                          Delete List...
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area: Only show if not loading */}
        {!isLoading &&
          (selectedList ? (
            <div className="space-y-6">
              {/* Calendar View */}
              <CalendarView
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                todosForMonth={todosForSelectedList}
                rangeSelectionStart={rangeSelectionStart}
                rangeSelectionEndHover={rangeSelectionEndHover}
                isDraggingRange={isDraggingRange}
                onDateSelect={handleDateSelect}
                onAddTodoClick={handleAddTodoClick}
                onMonthChange={handleMonthChange}
                onRangeSelectStart={handleRangeSelectStart}
                onRangeSelectEnd={handleMouseUp} // Keep prop for clarity, though handled by window
                onRangeHover={handleRangeHover}
              />

              {/* Divider */}
              <hr className="border-gray-600/50" />

              {/* Details Area: Todos for Selected Date (Styled) */}
              <div className="p-5 border border-gray-600/40 rounded-xl bg-gray-800/60 backdrop-blur-md shadow-lg min-h-[200px]">
                <h2 className="text-xl font-semibold text-white/90 mb-4 border-b border-gray-600/50 pb-2">
                  Todos for:{" "}
                  <span className="text-indigo-400">
                    {" "}
                    {/* Use Tailwind semantic color */}
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </h2>

                {/* Todo List for Selected Date (Styled) */}
                <ul className="space-y-2.5 max-h-80 overflow-y-auto pr-2 -mr-2 styled-scrollbar">
                  {" "}
                  {/* Optional custom scrollbar class */}
                  {todosForSelectedDate.length > 0 ? (
                    todosForSelectedDate.map((todo) => (
                      <li
                        key={todo.id}
                        className="flex items-center justify-between p-2.5 bg-gray-700/50 border border-gray-600/30 rounded-lg hover:bg-gray-700/70 group transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-3 flex-grow mr-2 min-w-0">
                          {" "}
                          {/* Ensure flex item can shrink */}
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleTodo(todo.id)}
                            className="flex-shrink-0 h-4 w-4 bg-gray-600 border-gray-500 rounded text-indigo-500 focus:ring-indigo-400 focus:ring-offset-gray-800 cursor-pointer"
                            id={`todo-${todo.id}`}
                          />
                          <label
                            htmlFor={`todo-${todo.id}`}
                            className={`flex-grow text-sm cursor-pointer truncate ${
                              // Add truncate
                              todo.completed
                                ? "line-through text-gray-400"
                                : "text-gray-100"
                            }`}
                            title={todo.text} // Add title for full text on hover
                          >
                            {todo.text}
                          </label>
                        </div>
                        <button
                          onClick={() => openDeleteTodoModal(todo)}
                          className="flex-shrink-0 p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none rounded"
                          title="Delete todo"
                        >
                          {/* Trash Icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No todos for this date. Click the date number on the
                      calendar to add one.
                    </p>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            /* Placeholder if no list selected */
            <p className="text-base text-gray-400 text-center pt-10">
              {lists.length > 0
                ? "Select a list above to view its calendar and details."
                : "Create a list using the dropdown to get started."}
            </p>
          ))}
      </div>

      {/* --- Modals (Remain outside conditional rendering) --- */}
      {/* List Modals */}
      <Modal
        isOpen={isCreateListModalOpen}
        onClose={closeCreateListModal}
        onConfirm={confirmCreateList}
        title="Create New List"
        confirmText="Create"
      >
        <label
          htmlFor="new-list-name"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          List Name:
        </label>
        <input
          ref={createInputRef}
          type="text"
          id="new-list-name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmCreateList();
            if (e.key === "Escape") closeCreateListModal();
          }}
          className="w-full px-3 py-2 bg-gray-600/70 border border-gray-500/50 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm" // Use Tailwind semantic colors
          placeholder="Enter list name"
        />
      </Modal>
      <Modal
        isOpen={isDeleteListModalOpen}
        onClose={closeDeleteListModal}
        onConfirm={confirmDeleteList}
        title="Delete List"
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500" // Use Tailwind semantic colors
      >
        <p>
          Are you sure you want to delete the list{" "}
          <strong className="font-medium text-white">
            "{selectedList?.name}"
          </strong>{" "}
          and all its todos?
        </p>
        <p className="mt-1 text-xs text-gray-400">
          This action cannot be undone.
        </p>
      </Modal>
      {/* Todo Deletion Modal */}
      <Modal
        isOpen={isDeleteTodoModalOpen}
        onClose={closeDeleteTodoModal}
        onConfirm={confirmDeleteTodo}
        title="Delete Todo"
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500" // Use Tailwind semantic colors
      >
        <p>Are you sure you want to delete this todo?</p>
        <p className="mt-2 text-sm font-medium text-gray-100 bg-gray-600/50 p-2 rounded border border-gray-500/30 break-words">
          {" "}
          {/* Allow long words to break */}"{todoToDelete?.text}"
        </p>
        <p className="mt-2 text-xs text-gray-400">
          This action cannot be undone.
        </p>
      </Modal>

      {/* Add Todo Modal */}
      <Modal
        isOpen={isAddTodoModalOpen}
        onClose={closeAddTodoModal}
        onConfirm={confirmAddTodoFromModal}
        title={addTodoTargetRange ? "Add Todo to Range" : "Add Todo"}
        confirmText="Add Todo"
      >
        <label
          htmlFor="new-todo-text-modal"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Todo Text:
        </label>
        <input
          ref={addTodoModalInputRef}
          type="text"
          id="new-todo-text-modal"
          value={newTodoTextForModal}
          onChange={(e) => setNewTodoTextForModal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmAddTodoFromModal();
            if (e.key === "Escape") closeAddTodoModal();
          }}
          className="w-full px-3 py-2 bg-gray-600/70 border border-gray-500/50 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm" // Use Tailwind semantic colors
          placeholder="Enter todo description"
        />
        <p className="text-xs text-gray-400 mt-2">
          For list:{" "}
          <span className="font-medium text-white">{selectedList?.name}</span>
          <br />
          {addTodoTargetDate && (
            <>
              Date:{" "}
              <span className="font-medium text-white">
                {addTodoTargetDate.toLocaleDateString()}
              </span>
            </>
          )}
          {addTodoTargetRange && (
            <>
              Date Range:{" "}
              <span className="font-medium text-white">
                {addTodoTargetRange.start.toLocaleDateString()}
              </span>{" "}
              to{" "}
              <span className="font-medium text-white">
                {addTodoTargetRange.end.toLocaleDateString()}
              </span>
            </>
          )}
        </p>
      </Modal>
    </div>
  );
};

export default App;
