// hooks/usePermission.ts

import {useAuth} from "../../context/AuthContext";

export function usePermission() {
    const {user} = useAuth();

    const hasPermission = (permission: string): boolean => {
        return user?.permissions?.includes(permission) ?? false;
    };

    return {hasPermission};
}