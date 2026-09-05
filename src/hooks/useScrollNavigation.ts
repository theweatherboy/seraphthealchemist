"use client";
// Navigation is explicit: wheel gestures must remain available for reading,
// forms and payment dialogs. Retain the hook signature for existing pages.
export function useScrollNavigation(_currentPageIndex: number, _sequence: string[]) {
  void _currentPageIndex;
  void _sequence;
}
