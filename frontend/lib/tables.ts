import {RowSelectionState} from "@tanstack/react-table";

export function getEventIdsFromRowSelection(rowSelection: RowSelectionState): number[] {
  return Object.keys(rowSelection).filter(k => rowSelection[k]).map(Number)
}

export function createRowSelectionFromEventIds(eventIds: number []) : RowSelectionState {
  return Object.fromEntries(eventIds.map(id => [id, true]))
}