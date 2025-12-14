import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";

// URL-based Protected Route
export default function ProtectedRoute( { children } ) {
    const { state, loading } = useAuth();
    const location = useLocation();

    if ( loading ) return null; //wait for session fetch 

    // User not logged in → redirect to login
    if ( !state.valid ) return <Navigate to="/login" replace />;

    const currentPath = location.pathname;

    // Debug (optional)
    // console.log( "Allowed URLs:", state.allowedUrls );
    // console.log( "Current path:", currentPath );

    // If user is NOT allowed to open this path
    // For specific url
    // const isAllowed = state.allowedUrls?.some( (url) =>
    //     currentPath === url || currentPath.startsWith( url + '/' )
    // );

    const normalizePath = ( path ) => path.replace( /\/$/, '' ); // Remove trailing slashes for comparison
    const isAllowed = state.allowedUrls?.some( ( url ) =>
        normalizePath( currentPath ) === normalizePath( url ) || currentPath.startsWith( normalizePath( url ) + '/' )
    );

    
    if ( !isAllowed ) return <Navigate to="/forbidden" replace />;
    return <Outlet />;
}
