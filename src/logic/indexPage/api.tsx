import {pocketbase} from "@/lib/pocketbase";
import {DashboardSummarySchema} from "@/types/types";
import {useQuery} from "@tanstack/react-query";
import {indexPageStore} from "@/logic/indexPage/indexPageStore";
import {NanoUtils} from "@/logic/common/utils";

type INDEX_QUERY_KEYS_ENUM = "dashboardSummary";

export class INDEX_QUERY_KEYS {
    public static DASHBOARD_SUMMARY = "dashboardSummary" as INDEX_QUERY_KEYS_ENUM;
}

const fetchDashboardSummary = async () => {
    const resp = await pocketbase.send(NanoUtils.withUrlPrefix("/dashboard-summary"), {
        method: "GET",
    });

    const validatedData = resp.map((r: any) => DashboardSummarySchema.parse(r));

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
