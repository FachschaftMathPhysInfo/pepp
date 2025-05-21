import {RowSelectionState} from "@tanstack/react-table";

export function getIdsFromRowSelection(rowSelection: RowSelectionState): number[] {
  return Object.keys(rowSelection).filter(k => rowSelection[k]).map(Number)
}