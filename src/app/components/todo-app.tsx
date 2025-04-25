"use client";

import React from "react";
// Import hook
import { useTodoManager } from "../hooks/useTodoManager";
// Import components
import CalendarView from "./calendar-view";
import ListManager from "./list-manager";
import Modal from "./modal";
import TodoDetails from "./todo-details";

// The main App component - Now uses the hook for logic and state
const TodoApp: React.FC = () => {
  // Use the custom hook to get state and handlers
  const {
    isLoading,
    lists,
    selectedListId,
    selectedList,
    todosForSelectedList, // Use this for CalendarView
    todosForSelectedDate, // Use this for TodoDetails
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
    openDeleteTodoModal, // Pass the specific handler for opening delete todo modal
    closeDeleteTodoModal,
    confirmDeleteTodo,
    // Pass refs to Modals if needed for focusing
    createListInputRef,
    addTodoModalInputRef,
  } = useTodoManager();

  // Find list name for delete modal locally (or pass from hook if preferred)
  const listToDelete = lists.find((list) => list.id === listToDeleteId);

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
    <div className="flex justify-center items-start pt-6 sm:pt-10 pb-10 sm:pb-16 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 font-sans">
      <div className="w-full max-w-2xl px-3 sm:px-4 pb-6">
        {" "}
        {/* Adjusted max-width for better vertical layout */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-white/90">
          My Planner
        </h1>
        {/* List Manager */}
        <ListManager
          lists={lists}
          selectedList={selectedList}
          isLoading={isLoading}
          onSelectList={handleSelectList}
          onCreateList={openCreateListModal}
          onRenameList={handleRenameList}
          onDeleteList={openDeleteListModal} // Pass the handler to open modal
        />
        {/* Main Content Area: Always vertical layout now */}
        {!isLoading && selectedList ? (
          <div className="space-y-4 sm:space-y-6 mb-6">
            {" "}
            {/* Use space-y for vertical stacking */}
            {/* Calendar */}
            <div>
              <CalendarView
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                allTodosForList={todosForSelectedList} // Pass all todos for range bars
                rangeSelectionStart={rangeSelectionStart}
                rangeSelectionEndHover={rangeSelectionEndHover}
                isDraggingRange={isDraggingRange}
                onDateSelect={handleDateSelect}
                onAddTodoClick={handleAddTodoClick}
                onMonthChange={handleMonthChange}
                onRangeSelectStart={handleRangeSelectStart}
                onRangeHover={handleRangeHover}
              />
            </div>
            {/* Todo Details */}
            <div>
              <TodoDetails
                selectedDate={selectedDate}
                todos={todosForSelectedDate} // Pass filtered todos
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={openDeleteTodoModal}
              />
            </div>
          </div>
        ) : (
          /* Placeholder if no list selected or loading */
          !isLoading && (
            <p className="text-base text-gray-400 text-center pt-10 mb-6">
              {lists.length > 0
                ? "Select a list above to view its calendar and details."
                : "Create a list using the dropdown to get started."}
            </p>
          )
        )}
      </div>

      {/* --- Modals (Pass state and handlers from hook) --- */}
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
          ref={createListInputRef} // Pass ref if needed by modal for focus
          type="text"
          id="new-list-name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)} // Use setter from hook
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmCreateList();
            if (e.key === "Escape") closeCreateListModal();
          }}
          className="w-full px-3 py-2 bg-gray-600/70 border border-gray-500/50 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm"
          placeholder="Enter list name"
          autoFocus // Add autoFocus here if modal doesn't handle it internally
        />
      </Modal>

      <Modal
        isOpen={isDeleteListModalOpen}
        onClose={closeDeleteListModal}
        onConfirm={confirmDeleteList}
        title="Delete List"
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      >
        <p>
          Are you sure you want to delete the list{" "}
          <strong className="font-medium text-white">
            &quot;{listToDelete?.name}&quot;
          </strong>{" "}
          and all its todos?
        </p>
        <p className="mt-1 text-xs text-gray-400">
          This action cannot be undone.
        </p>
      </Modal>

      <Modal
        isOpen={isDeleteTodoModalOpen}
        onClose={closeDeleteTodoModal}
        onConfirm={confirmDeleteTodo}
        title="Delete Todo"
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      >
        <p>Are you sure you want to delete this todo?</p>
        <p className="mt-2 text-sm font-medium text-gray-100 bg-gray-600/50 p-2 rounded border border-gray-500/30 break-words">
          &quot;{todoToDelete?.text}&quot;
          {todoToDelete?.endDate && (
            <span className="block text-xs text-gray-400 mt-1">
              (Range: {todoToDelete.startDate} to {todoToDelete.endDate})
            </span>
          )}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          This action cannot be undone.
        </p>
      </Modal>

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
          ref={addTodoModalInputRef} // Pass ref if needed by modal for focus
          type="text"
          id="new-todo-text-modal"
          value={newTodoTextForModal}
          onChange={(e) => setNewTodoTextForModal(e.target.value)} // Use setter from hook
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmAddTodoFromModal();
            if (e.key === "Escape") closeAddTodoModal();
          }}
          className="w-full px-3 py-2 bg-gray-600/70 border border-gray-500/50 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm"
          placeholder="Enter todo description"
          autoFocus // Add autoFocus here if modal doesn't handle it internally
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

export default TodoApp;
