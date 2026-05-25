import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {useAuth} from '../context/AuthContext';
import {userService} from '../services/userService';
import {CreateRoleDTO, PermissionDTO, RoleDTO, UserDTO, UserRole} from '../types';
import {Badge} from './ui/badge';
import {Button} from './ui/button';
import {Checkbox} from './ui/checkbox';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Card, CardContent} from './ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './ui/tabs';
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from './ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from './ui/select';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from './ui/table';
import {ArrowLeft, Briefcase, Pencil, Shield, Trash2, User, UserPlus, Users,} from 'lucide-react';
import {toast} from 'sonner';

function getPermissionLabel(permission: PermissionDTO) {
    return permission.label || permission.name;
}

function getSelectedPermissions(
    allPermissions: PermissionDTO[],
    selectedPermissionIds: number[],
): PermissionDTO[] {
    return allPermissions.filter(
        (permission): permission is PermissionDTO & { id: number } =>
            permission.id != null && selectedPermissionIds.includes(permission.id),
    );
}

function buildRolePermissionsPayload(
    allPermissions: PermissionDTO[],
    selectedPermissionIds: number[],
): Pick<CreateRoleDTO, 'permissionIds' | 'permissions'> {
    const selectedPermissions = getSelectedPermissions(allPermissions, selectedPermissionIds);

    if (selectedPermissions.length === 0) {
        return {};
    }

    return {
        permissionIds: selectedPermissionIds,
        permissions: selectedPermissions,
    };
}

function buildRoleDtoForUpdate(
    id: number,
    name: string,
    allPermissions: PermissionDTO[],
    selectedPermissionIds: number[],
): RoleDTO {
    return {
        id,
        name,
        permissions: getSelectedPermissions(allPermissions, selectedPermissionIds),
    };
}

function RolePermissions({permissions}: { permissions?: PermissionDTO[] }) {
    if (!permissions?.length) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {permissions.map((permission) => (
                <Badge key={permission.id ?? permission.name} variant="secondary">
                    {getPermissionLabel(permission)}
                </Badge>
            ))}
        </div>
    );
}

function formatRegistrationDate(dateStr?: string) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
}

function isAdminCargo(cargoName?: string, role?: UserRole) {
    return role === 'ADMIN' || cargoName?.toLowerCase() === 'admin';
}

function resolveUserCargoId(user: UserDTO, cargos: RoleDTO[]): number | undefined {
    if (user.roleId != null) return user.roleId;
    if (user.cargoId != null) return user.cargoId;
    if (user.role === 'ADMIN') return cargos.find((c) => c.name.toLowerCase() === 'admin')?.id;
    if (user.role === 'USER') return cargos.find((c) => c.name.toLowerCase() === 'usuario')?.id;
    return cargos[0]?.id;
}

function CargoSelect({
                         value,
                         cargos,
                         disabled,
                         onChange,
                     }: {
    value?: number;
    cargos: RoleDTO[];
    disabled?: boolean;
    onChange: (cargoId: number) => void;
}) {
    const selected = cargos.find((c) => c.id === value);

    return (
        <Select
            value={value != null ? String(value) : undefined}
            onValueChange={(v) => onChange(Number(v))}
            disabled={disabled || cargos.length === 0}
        >
            <SelectTrigger
                size="sm"
                className="w-full min-w-[120px] max-w-[160px] border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-60"
            >
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <SelectValue placeholder="Selecione">{selected?.name ?? '—'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                {cargos.map((cargo) => (
                    <SelectItem key={cargo.id} value={String(cargo.id)}>
                        {cargo.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function UserManagement() {
    const navigate = useNavigate();
    const {user: currentUser} = useAuth();

    const [cargos, setCargos] = useState<RoleDTO[]>([]);
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingCargos, setLoadingCargos] = useState(true);

    const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
    const [cargoDialogOpen, setCargoDialogOpen] = useState(false);
    const [editingCargo, setEditingCargo] = useState<RoleDTO | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserDTO | null>(null);
    const [cargoToDelete, setCargoToDelete] = useState<RoleDTO | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newCargoId, setNewCargoId] = useState<number | undefined>();

    const [cargoName, setCargoName] = useState('');
    const [allPermissions, setAllPermissions] = useState<PermissionDTO[]>([]);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);

    const isCurrentUser = useCallback(
        (u: UserDTO) =>
            (currentUser?.id != null && u.id === currentUser.id) ||
            u.email === currentUser?.email,
        [currentUser],
    );

    const loadCargos = useCallback(async () => {
        setLoadingCargos(true);
        try {
            const data = await userService.findAllCargos();
            const roles = data.map((role) => ({
                ...role,
                permissions: role.permissions ?? [],
            }));
            setCargos(roles);
        } catch {
            setCargos([]);
        } finally {
            setLoadingCargos(false);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const data = await userService.findAllUsers();
            setUsers(data);
        } catch {
            toast.error('Não foi possível carregar os usuários');
            if (currentUser) {
                setUsers([]);
            }
        } finally {
            setLoadingUsers(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        loadCargos();
        loadUsers();
    }, [currentUser, loadCargos, loadUsers, navigate]);

    useEffect(() => {
        if (newCargoId == null && cargos.length > 0) {
            const defaultCargo =
                cargos.find((c) => c.name.toLowerCase() === 'usuario') ?? cargos[0];
            setNewCargoId(defaultCargo.id);
        }
    }, [cargos, newCargoId]);

    const handleCargoChange = async (target: UserDTO, cargoId: number) => {
        if (!target.id || isCurrentUser(target)) return;

        const cargo = cargos.find((c) => c.id === cargoId);
        const previous = users;
        setUsers((list) =>
            list.map((u) =>
                u.id === target.id
                    ? {
                        ...u,
                        cargoId,
                        cargoName: cargo?.name,
                        role: cargo?.name.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'
                    }
                    : u,
            ),
        );

        try {
            await userService.updateUserCargo(target.id, cargoId);
            toast.success('Cargo atualizado');
        } catch {
            setUsers(previous);
            toast.error('Erro ao atualizar cargo');
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete?.id) return;

        setIsSubmitting(true);
        try {
            await userService.deleteUser(userToDelete.id);
            setUsers((list) => list.filter((u) => u.id !== userToDelete.id));
            toast.success('Usuário removido');
            setUserToDelete(null);
        } catch {
            toast.error('Erro ao remover usuário');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCargo = async () => {
        if (!cargoToDelete?.id) return;

        setIsSubmitting(true);
        try {
            await userService.deleteCargo(cargoToDelete.id);
            setCargos((list) => list.filter((c) => c.id !== cargoToDelete.id));
            toast.success('Cargo removido');
            setCargoToDelete(null);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Erro ao remover cargo';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAddUserForm = () => {
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        const defaultCargo =
            cargos.find((c) => c.name.toLowerCase() === 'usuario') ?? cargos[0];
        setNewCargoId(defaultCargo?.id);
    };

    const loadPermissions = useCallback(async () => {
        setLoadingPermissions(true);
        try {
            const data = await userService.findAllPermissions();
            setAllPermissions(data);
        } catch {
            toast.error('Não foi possível carregar as permissões');
            setAllPermissions([]);
        } finally {
            setLoadingPermissions(false);
        }
    }, []);

    const resetCargoForm = () => {
        setCargoName('');
        setSelectedPermissionIds([]);
        setEditingCargo(null);
    };

    const togglePermission = (permissionId: number, checked: boolean | 'indeterminate') => {
        setSelectedPermissionIds((prev) =>
            checked === true
                ? [...prev, permissionId]
                : prev.filter((id) => id !== permissionId),
        );
    };

    const openCargoDialog = (cargo?: RoleDTO) => {
        if (cargo) {
            setEditingCargo(cargo);
            setCargoName(cargo.name);
            setSelectedPermissionIds(
                cargo.permissions?.map((p) => p.id).filter((id): id is number => id != null) ?? [],
            );
        } else {
            resetCargoForm();
        }
        setCargoDialogOpen(true);
        loadPermissions();
    };

    const handleSaveCargo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cargoName.trim()) {
            toast.error('Informe o nome do cargo');
            return;
        }

        setIsSubmitting(true);
        try {
            const permissionsPayload = buildRolePermissionsPayload(
                allPermissions,
                selectedPermissionIds,
            );

            if (editingCargo?.id) {
                const updateRolePayload = buildRoleDtoForUpdate(
                    editingCargo.id,
                    cargoName.trim(),
                    allPermissions,
                    selectedPermissionIds,
                );

                const updated = await userService.updateCargo(editingCargo.id, updateRolePayload);
                setCargos((list) =>
                    list.map((c) =>
                        c.id === editingCargo.id
                            ? {
                                ...c, ...updated,
                                permissions: updated.permissions ?? updateRolePayload.permissions ?? []
                            }
                            : c,
                    ),
                );
                toast.success('Cargo atualizado');
            } else {
                const createRolePayload: CreateRoleDTO = {
                    name: cargoName.trim(),
                    ...permissionsPayload,
                };

                const created = await userService.createCargo(createRolePayload);
                setCargos((list) => [...list, {...created, permissions: created.permissions ?? []}]);
                toast.success('Cargo adicionado');
            }
            setCargoDialogOpen(false);
            resetCargoForm();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao salvar cargo';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newName.trim() || !newEmail.trim() || newPassword.length < 8 || newCargoId == null) {
            toast.error('Preencha todos os campos. A senha deve ter no mínimo 8 caracteres.');
            return;
        }

        const cargo = cargos.find((c) => c.id === newCargoId);

        setIsSubmitting(true);
        try {
            const created = await userService.createUser({
                name: newName.trim(),
                email: newEmail.trim(),
                password: newPassword,
                roleId: newCargoId,
            });
            setUsers((list) => [
                ...list,
                {
                    ...created,
                    roleId: created.roleId ?? newCargoId,
                    cargoId: created.roleId ?? newCargoId,
                    cargoName: created.cargoName ?? cargo?.name,
                },
            ]);
            toast.success('Usuário adicionado com sucesso');
            setAddUserDialogOpen(false);
            resetAddUserForm();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao adicionar usuário';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) return null;

    const renderUserName = (u: UserDTO) => {
        const isSelf = isCurrentUser(u);
        const cargoName = u.cargoName ?? cargos.find((c) => c.id === u.cargoId)?.name;
        return (
            <div className="flex items-center gap-2">
                {isAdminCargo(cargoName, u.role) && (
                    <Shield className="h-4 w-4 shrink-0 text-violet-600" />
                )}
                <span className="font-medium">
          {u.name}
                    {isSelf && (
                        <span className="ml-1 font-normal text-muted-foreground">(Você)</span>
                    )}
        </span>
            </div>
        );
    };

    const usersTable = (
        <>
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Nome</TableHead>
                            <TableHead className="text-muted-foreground">Email/Login</TableHead>
                            <TableHead className="text-muted-foreground">Cargo</TableHead>
                            <TableHead className="text-center text-muted-foreground">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingUsers ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                    Carregando usuários...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                    Nenhum usuário cadastrado
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => (
                                <TableRow key={u.id ?? u.email}>
                                    <TableCell>{renderUserName(u)}</TableCell>
                                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                    <TableCell>
                                        <CargoSelect
                                            value={resolveUserCargoId(u, cargos)}
                                            cargos={cargos}
                                            disabled={isCurrentUser(u)}
                                            onChange={(cargoId) => handleCargoChange(u, cargoId)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive"
                                            disabled={isCurrentUser(u)}
                                            onClick={() => setUserToDelete(u)}
                                            title={
                                                isCurrentUser(u)
                                                    ? 'Você não pode remover sua própria conta'
                                                    : 'Remover usuário'
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="space-y-3 md:hidden">
                {loadingUsers ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Carregando usuários...</p>
                ) : users.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Nenhum usuário cadastrado</p>
                ) : (
                    users.map((u) => (
                        <div key={u.id ?? u.email} className="space-y-3 rounded-lg border bg-card p-4">
                            <div className="flex items-start justify-between gap-2">
                                {renderUserName(u)}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                    disabled={isCurrentUser(u)}
                                    onClick={() => setUserToDelete(u)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Email/Login</span>
                                    <p className="break-all">{u.email}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Cargo</span>
                                    <div className="mt-1">
                                        <CargoSelect
                                            value={resolveUserCargoId(u, cargos)}
                                            cargos={cargos}
                                            disabled={isCurrentUser(u)}
                                            onChange={(cargoId) => handleCargoChange(u, cargoId)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );

    const cargosTable = (
        <>
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Nome</TableHead>
                            <TableHead className="text-muted-foreground">Permissões</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingCargos ? (
                            <TableRow>
                                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                                    Carregando cargos...
                                </TableCell>
                            </TableRow>
                        ) : cargos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                                    Nenhum cargo cadastrado
                                </TableCell>
                            </TableRow>
                        ) : (
                            cargos.map((cargo) => (
                                <TableRow key={cargo.id ?? cargo.name}>
                                    <TableCell className="font-medium">{cargo.name}</TableCell>
                                    <TableCell>
                                        <RolePermissions permissions={cargo.permissions} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground"
                                                onClick={() => openCargoDialog(cargo)}
                                                title="Editar cargo"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => setCargoToDelete(cargo)}
                                                title="Remover cargo"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="space-y-3 md:hidden">
                {loadingCargos ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Carregando cargos...</p>
                ) : cargos.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Nenhum cargo cadastrado</p>
                ) : (
                    cargos.map((cargo) => (
                        <div key={cargo.id ?? cargo.name} className="space-y-3 rounded-lg border bg-card p-4">
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-medium">{cargo.name}</p>
                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground"
                                        onClick={() => openCargoDialog(cargo)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => setCargoToDelete(cargo)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Permissões</span>
                                <div className="mt-1">
                                    <RolePermissions permissions={cargo.permissions} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );

    return (
        <div className="container mx-auto max-w-5xl p-4 sm:p-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 sm:mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>

            <Card className="border shadow-sm">
                <CardContent className="p-4 sm:p-6">
                    <div className="mb-6 flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                            <User className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold sm:text-2xl">Gerenciamento do Sistema</h1>
                            <p className="text-sm text-muted-foreground">
                                Gerencie usuários, permissões e cargos do sistema
                            </p>
                        </div>
                    </div>

                    <Tabs defaultValue="usuarios" className="w-full gap-4">
                        <TabsList className="grid h-11 w-full grid-cols-2 rounded-lg bg-muted p-1">
                            <TabsTrigger
                                value="usuarios"
                                className="gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                <Users className="h-4 w-4" />
                                Usuários
                            </TabsTrigger>
                            <TabsTrigger
                                value="cargos"
                                className="gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                <Briefcase className="h-4 w-4" />
                                Cargos
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="usuarios" className="mt-0 space-y-4">
                            <div className="flex justify-end">
                                <Button
                                    className="w-full bg-black text-white hover:bg-black/90 sm:w-auto"
                                    onClick={() => setAddUserDialogOpen(true)}
                                    disabled={loadingCargos}
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Adicionar Usuário
                                </Button>
                            </div>
                            {usersTable}
                            <div className="rounded-lg bg-muted/50 p-4 sm:p-5">
                                <div className="mb-2 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-violet-600" />
                                    <h2 className="font-semibold">Sobre os Cargos</h2>
                                </div>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                    <li>
                                        O cargo define o nível de acesso do usuário no sistema
                                    </li>
                                    <li>
                                        Gerencie os cargos disponíveis na aba <strong
                                        className="text-foreground">Cargos</strong>
                                    </li>
                                    <li>Você não pode alterar seu próprio cargo ou remover sua conta</li>
                                </ul>
                            </div>
                        </TabsContent>

                        <TabsContent value="cargos" className="mt-0 space-y-4">
                            <div className="flex justify-end">
                                <Button
                                    className="w-full bg-black text-white hover:bg-black/90 sm:w-auto"
                                    onClick={() => openCargoDialog()}
                                    disabled={loadingCargos}
                                >
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    Adicionar Cargo
                                </Button>
                            </div>
                            {cargosTable}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog
                open={addUserDialogOpen}
                onOpenChange={(open) => {
                    setAddUserDialogOpen(open);
                    if (!open) resetAddUserForm();
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adicionar Usuário</DialogTitle>
                        <DialogDescription>
                            Cadastre um novo usuário e defina seu cargo de acesso.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-name">Nome</Label>
                            <Input
                                id="new-name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Nome completo"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-email">Email/Login</Label>
                            <Input
                                id="new-email"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="usuario@email.com"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Senha</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                minLength={8}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Cargo</Label>
                            <Select
                                value={newCargoId != null ? String(newCargoId) : undefined}
                                onValueChange={(v) => setNewCargoId(Number(v))}
                                disabled={isSubmitting || cargos.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cargos.map((cargo) => (
                                        <SelectItem key={cargo.id} value={String(cargo.id)}>
                                            {cargo.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => setAddUserDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Adicionar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={cargoDialogOpen}
                onOpenChange={(open) => {
                    setCargoDialogOpen(open);
                    if (!open) resetCargoForm();
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingCargo ? 'Editar Cargo' : 'Adicionar Cargo'}</DialogTitle>
                        <DialogDescription>
                            {editingCargo
                                ? 'Atualize o nome do cargo e marque ou desmarque as permissões de acesso.'
                                : 'Cadastre um novo cargo e selecione as permissões de acesso.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveCargo} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cargo-name">Nome</Label>
                            <Input
                                id="cargo-name"
                                value={cargoName}
                                onChange={(e) => setCargoName(e.target.value)}
                                placeholder="Ex: admin, operador"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Permissões</Label>
                            {loadingPermissions ? (
                                <p className="text-sm text-muted-foreground">Carregando permissões...</p>
                            ) : allPermissions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Nenhuma permissão disponível</p>
                            ) : (
                                <div className="max-h-52 space-y-2 overflow-y-auto rounded-md border p-3">
                                    {allPermissions.map((permission) => {
                                        const permissionId = permission.id;
                                        if (permissionId == null) return null;

                                        const checkboxId = editingCargo
                                            ? `permission-edit-${permissionId}`
                                            : `permission-${permissionId}`;

                                        return (
                                            <label
                                                key={permissionId}
                                                htmlFor={checkboxId}
                                                className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-1 hover:bg-muted/50"
                                            >
                                                <Checkbox
                                                    id={checkboxId}
                                                    checked={selectedPermissionIds.includes(permissionId)}
                                                    onCheckedChange={(checked) =>
                                                        togglePermission(permissionId, checked)
                                                    }
                                                    disabled={isSubmitting}
                                                />
                                                <span className="text-sm">{getPermissionLabel(permission)}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <DialogFooter className="flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => setCargoDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : editingCargo ? 'Salvar' : 'Adicionar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O usuário{' '}
                            <strong>{userToDelete?.name}</strong> perderá o acesso ao sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                        <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            disabled={isSubmitting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isSubmitting ? 'Removendo...' : 'Remover'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!cargoToDelete} onOpenChange={(open) => !open && setCargoToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover cargo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            O cargo <strong>{cargoToDelete?.name}</strong> será removido. Usuários vinculados
                            precisarão ser reatribuídos a outro cargo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                        <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCargo}
                            disabled={isSubmitting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isSubmitting ? 'Removendo...' : 'Remover'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
