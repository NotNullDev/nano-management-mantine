import { pocketbase } from "@/lib/pocketbase";
import { DashboardSummary, DashboardSummarySchema } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type INDEX_QUERY_KEYS_ENUM = "dashboardSummary";

export class INDEX_QUERY_KEYS {
  public static DASHBOARD_SUMMARY = "dashboardSummary" as INDEX_QUERY_KEYS_ENUM;
}

export type IndexPageStoreType = {
  summary: DashboardSummary | null;
};

export const indexPageStore = create<IndexPageStoreType>()(
  immer((set, get, store) => {
    return {
      summary: null,
    };
  })
);

const fetchDashboardSummary = async () => {
  const resp = await pocketbase.send("/dashboard-summary", {
    method: "GET",
  });

  const validatedData = DashboardSummarySchema.parse(resp);

  return validatedData;
};

function useDashboardSummary() {
  useQuery([INDEX_QUERY_KEYS.DASHBOARD_SUMMARY], fetchDashboardSummary, {
    onSuccess: (data) => {
      indexPageStore.setState((state) => {
        state.summary = data;
      });
    },
  });
}

export function useIndexData() {
  useDashboardSummary();
}
