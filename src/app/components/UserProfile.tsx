import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ArrowLeft, Lock, Mail, Save, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

export function UserProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    const userId = user.id || 1;

    try {
      await updateUser(userId, name, email);
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha de requisição';
      toast.error('Erro ao atualizar: ' + message);
    }
  };

  const handleCancelEdit = () => {
    setName(user.name);
    setEmail(user.email);
    setIsEditing(false);
  };

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      toast.error('Informe sua senha atual');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('A nova senha deve ser diferente da atual');
      return;
    }

    const userId = user.id || 1;

    setIsSavingPassword(true);
    try {
      const response = await authService.updatePassword({
        userId,
        currentPassword,
        newPassword,
      });
      if (response?.token) {
        localStorage.setItem('hf_token', response.token);
      }
      toast.success('Senha alterada com sucesso!');
      setPasswordDialogOpen(false);
      resetPasswordForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao alterar senha';
      toast.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Meu Perfil</CardTitle>
            <CardDescription>Gerencie suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    <User className="mr-2 h-4 w-4" />
                    Editar Dados
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>Gerencie sua senha e segurança da conta</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
              <Lock className="mr-2 h-4 w-4" />
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open) resetPasswordForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua senha antiga e a nova senha para alterar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Antiga</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                required
                disabled={isSavingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                minLength={6}
                required
                disabled={isSavingPassword}
              />
              <p className="text-xs text-muted-foreground">
                A senha deve ter no mínimo 6 caracteres
              </p>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setPasswordDialogOpen(false)}
                disabled={isSavingPassword}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-black/90 sm:w-auto"
                disabled={isSavingPassword}
              >
                {isSavingPassword ? 'Salvando...' : 'Confirmar Alteração'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
