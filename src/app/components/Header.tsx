import React from 'react';
import {useNavigate} from 'react-router';
import {useAuth} from '../context/AuthContext';
import {Button} from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {Avatar, AvatarFallback} from './ui/avatar';
import {LogOut, User, Users} from 'lucide-react';
import {toast} from 'sonner';
import {usePermission} from "./hooks/usePermission";

export function Header() {
    const navigate = useNavigate();
    const {user, logout} = useAuth();

    const {hasPermission} = usePermission();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        toast.success('Logout realizado com sucesso');
        navigate('/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <header className="border-b bg-white">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-2 bg-blue-500 rounded-lg shrink-0">
                            <svg
                                className="h-5 w-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                />
                            </svg>
                        </div>
                        <span className="font-semibold text-base sm:text-lg truncate">Sistema de Água</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-red-600"
                            title="Sair"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>

                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <Avatar>
                                        <AvatarFallback className="bg-blue-500 text-white">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                                    <User className="mr-2 h-4 w-4" />
                                    Meu Perfil
                                </DropdownMenuItem>
                                {(hasPermission('MANAGE_USERS') || hasPermission('ADMIN')) && (
                                    <DropdownMenuItem onClick={() => navigate('/usuarios')}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Gerenciar Usuários
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
        </>
    );
}