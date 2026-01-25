export const normalizeFilters = (query) => {
    const toInt = (v) => {
        if (v === undefined || v === "" || v === "0") return null;
        const n = Number(v);
        return Number.isNaN(n) ? null : n;
    };

    return {
        bandiId: toInt(query.bandi_id),
        bandiName: query.searchbandi_name?.trim() || null,
        fromOffice: toInt(query.searchOffice),
        toOffice: toInt(query.searchToOffice),
        isCompleted:
            query.search_is_completed === "" || query.search_is_completed === undefined
                ? null
                : Number(query.search_is_completed),
        statusKey: query.searchStatus || null,
        transferReason: toInt(query.transferReason),
        roleId: toInt(query.searchRoles),
    };
};
