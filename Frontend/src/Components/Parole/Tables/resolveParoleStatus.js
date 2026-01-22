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
            color: "pass"
        };
    }

    if ( row.court_decision === "अस्वीकृत" ) {
        return {
            label: "अस्वीकृत",
            color: "fail"
        };
    }

    if ( row.court_decision === "पास" ) {
        return {
            label: "स्वीकृत",
            color: "pass"
        };
    }

    if ( row.court_decision === "फेल" ) {
        return {
            label: "अस्वीकृत",
            color: "fail"
        };
    }

    if ( row.pyarole_rakhan_upayukat === "योग्य" ) {
        return {
            label: "प्यारोल योग्य",
            color: "yogya"
        };
    }
    if ( row.pyarole_rakhan_upayukat === "अयोग्य" ) {
        return {
            label: "प्यारोल अयोग्य",
            color: "ayogya"
        };
    }
    if ( row.pyarole_rakhan_upayukat === "छलफल" ) {
        return {
            label: "छलफल",
            color: "chalfal"
        };
    }
    if ( row.pyarole_rakhan_upayukat === "कागजात अपुग" ) {
        return {
            label: "कागजात अपुग",
            color: "lackofpaper"
        };
    }
    if ( row.pyarole_rakhan_upayukat === "पास" ) {
        return {
            label: "बोर्डबाट पास",
            color: "pass"
        };
    }

    if ( row.pyarole_rakhan_upayukat === "फेल" ) {
        return {
            label: "बोर्डबाट फेल",
            color: "fail"
        };
    }

    return {
        label: "विचाराधीन",
        color: "info"
    };
};


// Red (#DA1E28 - Error/Critical): Indicates a critical error, high-risk, or blocked status that requires immediate attention.
// Orange (#FF832B - Warning/At Risk): Represents a warning, "at-risk" project status, or a serious, non-critical issue.
// Yellow (#F1C21B - Pending/In Progress): Signifies a medium priority, warning, or that a process is in progress/waiting.
// Green (#24A148 - Success/On Track): Indicates normal operation, success, completed tasks, or that a project is on track.
// Blue (#0043CE - Information/Neutral): Represents passive notifications, information, or tasks that are in progress but not critical.
// Gray (#6F6F6F - Draft/Inactive): Used for inactive, drafted, cancelled, or not-started jobs. 