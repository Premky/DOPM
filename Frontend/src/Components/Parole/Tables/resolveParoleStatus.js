export const resolveParoleStatus = ( row ) => {
    // priority-based resolution
    // console.log( row );
    if ( row.is_forwarded ) {
        return {
            label: "पठाइएको",
            color: "info"
        };
    }

    if ( row.court_decision === "स्वीकृत" ) {
        return {
            label: "स्वीकृत",
            color: "success"
        };
    }

    if ( row.court_decision === "अस्वीकृत" ) {
        return {
            label: "अस्वीकृत",
            color: "error"
        };
    }

    if ( row.pyarole_rakhan_upayukat === "योग्य" ) {
        return {
            label: "प्यारोल योग्य",
            color: "success"
        };
    }
    if ( row.pyarole_rakhan_upayukat === "अयोग्य" ) {
        return {
            label: "प्यारोल अयोग्य",
            color: "success"
        };
    }
    if ( row.pyarole_rakhan_upayukat === "छलफल" ) {
        return {
            label: "छलफल",
            color: "warning"
        };
    }
    if ( row.pyarole_rakhan_upayukat === "कागजात अपुग" ) {
        return {
            label: "कागजात अपुग",
            color: "warning"
        };
    }
    if ( row.pyarole_rakhan_upayukat === "पास" ) {
        return {
            label: "पास",
            color: "success"
        };
    }

    if ( row.pyarole_rakhan_upayukat === "फेल" ) {
        return {
            label: "फेल",
            color: "error"
        };
    }

    return {
        label: "विचाराधीन",
        color: "info"
    };
};
