import { pocketbase } from "@/lib/pocketbase";
import { DashboardSummary, DashboardSummarySchema } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";



export type IndexPageStoreType = {
  summary: DashboardSummary[];
};

export const indexPageStore = create<IndexPageStoreType>()(
  immer((set, get, store) => {
    return {
      summary: [],
    };
  })
);