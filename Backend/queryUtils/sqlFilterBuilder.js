export const addFilter = (where, params, condition, value) => {
    if (value === null || value === undefined) return { where, params };
    return {
        where: `${where} AND ${condition}`,
        params: [...params, value],
    };
};
