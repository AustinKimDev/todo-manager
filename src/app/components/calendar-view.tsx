import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { TodoItem, TodosByDate } from "../types"; // Relative path
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  formatDateKey,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseDateKey,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "../utils/date-helpers"; // Relative path

// --- Interfaces ---
interface CalendarViewProps {
  currentMonth: Date;
  selectedDate: Date;
  // Pass all todos for the list to calculate range overlaps
  allTodosForList: TodosByDate;
  rangeSelectionStart: Date | null;
  rangeSelectionEndHover: Date | null;
  isDraggingRange: boolean;
  onDateSelect: (date: Date) => void;
  onAddTodoClick: (date: Date) => void;
  onMonthChange: (newMonth: Date) => void;
  onRangeSelectStart: (date: Date) => void;
  onRangeHover: (date: Date) => void; // Handler passed from parent
}

// --- Constants ---
const MAX_BARS_TO_SHOW = 2; // Maximum number of bars to display per day

// --- Helper to get Range Todos affecting the current view ---
// This calculation could be memoized further if performance requires
const getVisibleRangeTodos = (
  currentMonth: Date,
  allTodos: TodosByDate
): TodoItem[] => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const viewStart = startOfWeek(monthStart);
  const viewEnd = endOfWeek(monthEnd);
  const rangeTodos: TodoItem[] = [];
  const addedIds = new Set<string>();

  Object.values(allTodos)
    .flat()
    .forEach((todo: TodoItem) => {
      if (todo.startDate && todo.endDate && !addedIds.has(todo.id)) {
        const todoStart = parseDateKey(todo.startDate);
        const todoEnd = parseDateKey(todo.endDate);
        // Check if the todo range overlaps with the current calendar view interval
        if (
          (todoStart <= viewEnd && todoEnd >= viewStart) ||
          (todoEnd >= viewStart && todoStart <= viewEnd)
        ) {
          rangeTodos.push(todo);
          addedIds.add(todo.id);
        }
      }
    });
  return rangeTodos;
};

// Calendar View Component (Styled & Interaction Update)
const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  selectedDate,
  allTodosForList, // Use this prop now
  rangeSelectionStart,
  rangeSelectionEndHover,
  isDraggingRange,
  onDateSelect,
  onAddTodoClick,
  onMonthChange,
  onRangeSelectStart,
  onRangeHover, // Receive the hover handler
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = useMemo(
    () => eachDayOfInterval(startDate, endDate),
    [startDate, endDate]
  );
  const today = useMemo(() => new Date(), []);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarGridRef = useRef<HTMLDivElement>(null); // Ref for touchmove listener

  const handleCellClick = useCallback(
    (day: Date) => {
      if (!isSameMonth(day, currentMonth)) return;
      onDateSelect(day);
    },
    [currentMonth, onDateSelect]
  );

  // --- Drag Start (Mouse & Touch) ---
  const handleDragStart = useCallback(
    (
      event:
        | React.MouseEvent<HTMLButtonElement>
        | React.TouchEvent<HTMLButtonElement>,
      day: Date
    ) => {
      if (!isSameMonth(day, currentMonth)) return;
      event.stopPropagation();
      onRangeSelectStart(day); // Signal potential drag start
    },
    [currentMonth, onRangeSelectStart]
  );

  // --- Date Number Click (Separate from Drag Start) ---
  const handleDateNumberClick = useCallback(
    (
      event: React.MouseEvent<HTMLButtonElement>, // Only for mouse clicks
      day: Date
    ) => {
      if (!isSameMonth(day, currentMonth)) return;
      event.stopPropagation();
      // Only trigger add todo if not dragging (drag end will handle range add)
      if (!isDraggingRange) {
        onAddTodoClick(day);
      }
    },
    [currentMonth, isDraggingRange, onAddTodoClick]
  );

  // --- Drag Hover (Mouse & Touch Move) ---
  // Debounce or throttle this in a real app if performance becomes an issue
  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDraggingRange || !calendarGridRef.current) return;

      const targetElement = document.elementFromPoint(clientX, clientY);
      if (targetElement) {
        // Find the closest parent cell or button with a date attribute
        const dateButton = targetElement.closest("[data-date]") as HTMLElement;
        if (dateButton && dateButton.dataset.date) {
          const dateStr = dateButton.dataset.date;
          try {
            // Add try-catch for safety with parseDateKey
            const hoveredDate = parseDateKey(dateStr);
            if (
              hoveredDate &&
              !isNaN(hoveredDate.getTime()) &&
              isSameMonth(hoveredDate, currentMonth)
            ) {
              onRangeHover(hoveredDate); // Call parent's handler
            }
          } catch (e) {
            console.error(
              "Error parsing date from data attribute:",
              dateStr,
              e
            );
          }
        }
      }
    },
    [isDraggingRange, currentMonth, onRangeHover]
  );

  // --- Touch Move Listener ---
  useEffect(() => {
    const gridElement = calendarGridRef.current;
    if (!gridElement || !isDraggingRange) return;

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        event.preventDefault(); // Prevent scroll
        handleDragMove(event.touches[0].clientX, event.touches[0].clientY);
      }
    };

    gridElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    }); // Use grid ref

    return () => {
      gridElement.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isDraggingRange, handleDragMove]); // Re-attach if dragging status or handler changes

  // --- Get Todos for a specific day (Directly assigned, used for dot/preview) ---
  const getDirectTodosForDay = useCallback(
    (day: Date): TodoItem[] => {
      const dayKey = formatDateKey(day);
      return (
        allTodosForList[dayKey]?.filter((todo: TodoItem) => !todo.endDate) || []
      );
    },
    [allTodosForList]
  );

  // Calculate visible range todos once per render
  const visibleRangeTodos = useMemo(
    () => getVisibleRangeTodos(currentMonth, allTodosForList),
    [currentMonth, allTodosForList]
  );

  // Function to get range bars for a specific day
  const getRangeBarsForDay = useCallback(
    (
      day: Date
    ): {
      todo: TodoItem;
      position: "start" | "middle" | "end" | "single";
    }[] => {
      const bars: {
        todo: TodoItem;
        position: "start" | "middle" | "end" | "single";
      }[] = [];
      visibleRangeTodos.forEach((todo) => {
        if (!todo.startDate || !todo.endDate) return;
        const todoStart = parseDateKey(todo.startDate);
        const todoEnd = parseDateKey(todo.endDate);
        if (isWithinInterval(day, todoStart, todoEnd)) {
          let position: "start" | "middle" | "end" | "single" = "middle";
          const isSingleDay = isSameDay(todoStart, todoEnd);
          if (isSingleDay && isSameDay(day, todoStart)) {
            position = "single";
          } else if (isSameDay(day, todoStart)) {
            position = "start";
          } else if (isSameDay(day, todoEnd)) {
            position = "end";
          }
          bars.push({ todo, position });
        }
      });
      // Sort bars: Incomplete first, then by start date, then by ID
      bars.sort((a, b) => {
        // 1. Sort by completion status (incomplete first)
        if (a.todo.completed !== b.todo.completed) {
          return a.todo.completed ? 1 : -1; // true (completed) comes after false (incomplete)
        }
        // 2. Sort by start date
        const startDiff =
          parseDateKey(a.todo.startDate!).getTime() -
          parseDateKey(b.todo.startDate!).getTime();
        if (startDiff !== 0) return startDiff;
        // 3. Sort by ID for stability
        return a.todo.id.localeCompare(b.todo.id);
      });
      return bars;
    },
    [visibleRangeTodos]
  );

  return (
    // Darker background, subtle border
    <div className="bg-gray-800/70 backdrop-blur-md border border-gray-500/20 p-3 sm:p-4 rounded-xl shadow-lg text-gray-200">
      {/* Header: Month Navigation */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="p-2 rounded-full text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-400" // Tailwind Semantic Color
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
        <h3 className="text-base sm:text-lg font-semibold text-white">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="p-2 rounded-full text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-400" // Tailwind Semantic Color
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

      {/* Calendar Grid - Apply aspect-ratio and manage touchmove */}
      <div
        ref={calendarGridRef}
        className="grid grid-cols-7 gap-px bg-gray-600/30 border border-gray-600/30 rounded-md overflow-hidden"
        // Touchmove handled by useEffect listener on the ref
      >
        {days.map((day) => {
          const dayKey = formatDateKey(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelectedDate = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const directTodos = getDirectTodosForDay(day);
          const rangeBars = getRangeBarsForDay(day);
          const hasDirectTodos = isCurrentMonth && directTodos.length > 0;

          // Determine drag range styling
          const isInSelectionRange =
            isDraggingRange &&
            rangeSelectionStart &&
            rangeSelectionEndHover &&
            isWithinInterval(day, rangeSelectionStart, rangeSelectionEndHover);
          const isSelectionRangeStart = isSameDay(day, rangeSelectionStart);
          const showMoreIndicator = rangeBars.length > MAX_BARS_TO_SHOW;

          return (
            // Cell container: Apply aspect-square
            <div
              key={dayKey}
              onClick={() => handleCellClick(day)}
              // Use aspect-square for ratio, adjust padding/content accordingly
              className={`relative aspect-square p-0.5 sm:p-1 transition-colors duration-100 cursor-pointer group overflow-hidden
                                ${
                                  !isCurrentMonth
                                    ? "bg-gray-700/40" // Tailwind Semantic Color
                                    : "bg-gray-800/50 hover:bg-gray-700/60" // Tailwind Semantic Colors
                                }
                                ${
                                  isInSelectionRange ? "bg-indigo-700/40" : ""
                                } // Tailwind Semantic Color
                                ${
                                  isSelectedDate && !isInSelectionRange
                                    ? "bg-indigo-900/50" // Tailwind Semantic Color
                                    : ""
                                }
                            `}
            >
              {/* Date Number Button: Handles Add Todo click and Drag start (mouse/touch) */}
              {/* Add data-date attribute for touchmove identification */}
              <button
                data-date={dayKey} // Add data attribute
                onMouseDown={(e) => handleDragStart(e, day)}
                onTouchStart={(e) => handleDragStart(e, day)} // Add touch start
                onClick={(e) => handleDateNumberClick(e, day)}
                onMouseEnter={(e) => {
                  // Handle mouse enter for hover
                  if (isDraggingRange) {
                    handleDragMove(e.clientX, e.clientY);
                  }
                }}
                disabled={!isCurrentMonth}
                // Adjust button size and position for aspect-square
                className={`
                                    absolute top-1 right-1 p-1 h-6 w-6 text-[10px] sm:text-xs rounded-full flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-gray-800 focus:ring-indigo-400 z-20 transition-colors duration-150 // Increase z-index slightly
                                    ${
                                      isCurrentMonth
                                        ? "text-gray-200 hover:bg-gray-600/80" // Tailwind Semantic Colors
                                        : "text-gray-500 cursor-not-allowed" // Tailwind Semantic Color
                                    }
                                    ${
                                      isSelectionRangeStart
                                        ? "bg-yellow-500 text-yellow-900 font-semibold ring-2 ring-yellow-400" // Tailwind Semantic Colors
                                        : ""
                                    }
                                    ${
                                      isInSelectionRange &&
                                      !isSelectionRangeStart
                                        ? "bg-indigo-500/80 text-white" // Tailwind Semantic Color
                                        : ""
                                    }
                                    ${
                                      !isInSelectionRange && isSelectedDate
                                        ? "bg-indigo-600 text-white font-semibold" // Tailwind Semantic Color
                                        : ""
                                    }
                                    ${
                                      !isInSelectionRange &&
                                      !isSelectedDate &&
                                      isToday
                                        ? "bg-blue-500/50 text-blue-100 font-semibold" // Tailwind Semantic Colors
                                        : ""
                                    }
                                `}
                title={
                  isCurrentMonth
                    ? isSelectionRangeStart
                      ? "Drag to end date"
                      : "Click/Tap to add todo, Drag/Swipe to add to range" // Update title
                    : ""
                }
              >
                {day.getDate()}
              </button>
              {/* Dot indicator for DIRECT todos ONLY */}
              {hasDirectTodos && (
                <span
                  // Adjust dot position if needed due to aspect-square
                  className={`absolute top-1.5 left-1.5 z-10 h-1.5 w-1.5 rounded-full ${
                    isInSelectionRange
                      ? "bg-white/70"
                      : isSelectedDate
                      ? "bg-indigo-200" // Tailwind Semantic Color
                      : "bg-blue-400" // Tailwind Semantic Color
                  }`}
                  title="Has specific todos"
                ></span>
              )}
              {/* Range Todo Bars */}
              {isCurrentMonth && rangeBars.length > 0 && (
                <div className="absolute top-[30px] sm:top-[28px] left-0 right-0 space-y-0.5 px-0.5 z-0">
                  {" "}
                  {/* Position bars below date number */}
                  {rangeBars
                    .slice(0, MAX_BARS_TO_SHOW)
                    .map(({ todo, position }) => {
                      // Limit number of bars shown
                      const fallbackColor = "hsl(260, 50%, 70%)"; // Default purple pastel
                      const isSingleDayRange = isSameDay(
                        parseDateKey(todo.startDate!),
                        parseDateKey(todo.endDate!)
                      );

                      // Safer width/margin logic addressing linter warning
                      const isMultiDayStart =
                        position === "start" && !isSingleDayRange;
                      const isMultiDayEnd =
                        position === "end" && !isSingleDayRange;
                      const barWidth =
                        isMultiDayStart || isMultiDayEnd
                          ? "calc(100% + 1px)"
                          : "100%";
                      const barMarginLeft = isMultiDayEnd ? "-1px" : "0";

                      return (
                        <div
                          key={todo.id}
                          title={todo.text}
                          className={`h-1 sm:h-2 ${
                            position === "start" || position === "single"
                              ? "rounded-l-sm"
                              : ""
                          } ${
                            position === "end" || position === "single"
                              ? "rounded-r-sm"
                              : ""
                          } ${todo.completed ? "opacity-60" : ""}`}
                          style={{
                            backgroundColor: todo.color || fallbackColor,
                            width: barWidth,
                            marginLeft: barMarginLeft,
                          }}
                        >
                          {/* Text inside the bar, shown only on start/single segments */}
                        </div>
                      );
                    })}
                  {/* "More" Indicator */}
                  {showMoreIndicator && (
                    <div className="text-center text-[9px] text-gray-400 leading-tight mt-0.5">
                      +{rangeBars.length - MAX_BARS_TO_SHOW} more
                    </div>
                  )}
                </div>
              )}
              {/* Optional: Preview for direct todos (might need adjustment with bars) */}
              {isCurrentMonth &&
                hasDirectTodos &&
                directTodos.length > 0 &&
                !showMoreIndicator && (
                  <div className="absolute bottom-0.5 left-0.5 right-0.5 space-y-px max-h-[35%] overflow-hidden text-[8px] sm:text-[9px] hidden group-hover:block sm:block z-0">
                    {" "}
                    {/* Show on hover or always on sm+ */}
                    {directTodos.slice(0, 1).map(
                      (
                        todo // Show fewer direct previews
                      ) => (
                        <div
                          key={todo.id}
                          className={`px-0.5 rounded-sm truncate ${
                            todo.completed
                              ? "text-gray-500 line-through"
                              : "text-gray-300"
                          } bg-gray-900/40`}
                        >
                          {todo.text}
                        </div>
                      )
                    )}
                    {directTodos.length > 1 && (
                      <div className="text-center text-gray-500 text-[8px]">
                        ...
                      </div>
                    )}
                  </div>
                )}
            </div>
          );
        })}
      </div>
      {/* Help text */}
      <p className="text-xs text-gray-400 mt-2 text-center hidden md:block">
        Click/Tap number to add todo. Click/Tap &amp; Drag between numbers to
        add todo to range. Click/Tap cell background to view day&apos;s todos.
      </p>
    </div>
  );
};

export default CalendarView;
