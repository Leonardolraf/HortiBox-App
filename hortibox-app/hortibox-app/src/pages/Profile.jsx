import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import * as orderService from '../services/orderService';
import { updateProfile, deleteProfileImage } from '../services/profileService';
import {
    User as UserIcon, Phone, MapPin, Package, LogOut, Camera, Loader2, Save, CameraOff, KeyRound, Mail as MailIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

export default function Profile() {
    const { userProfile, session, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, delivered: 0 });
    const [loadingPageData, setLoadingPageData] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showTypeSelection, setShowTypeSelection] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Estados para o formulário de contato
    const [formData, setFormData] = useState({ phone: '', address: '' });
    const [savingContact, setSavingContact] = useState(false);
    const [contactError, setContactError] = useState('');
    const [contactSuccess, setContactSuccess] = useState('');

    // Estados para o formulário de alteração de senha
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Estados para o formulário de alteração de email
    const [emailData, setEmailData] = useState({ newEmail: '', confirmEmail: '' });
    const [savingEmail, setSavingEmail] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [emailSuccess, setEmailSuccess] = useState('');


    useEffect(() => {
        const loadPageData = async () => {
            if (userProfile) {
                setFormData({
                    phone: userProfile.phone || '',
                    address: userProfile.address || ''
                });
                try {
                    // Busca os pedidos e já os coloca no estado 'orders'
                    const fetchedOrders = await orderService.getOrdersByCustomer(userProfile.id);
                    const ordersData = fetchedOrders || [];
                    setOrders(ordersData);

                    // Agora, usa a variável 'ordersData' para fazer os cálculos
                    const totalSpent = ordersData.reduce((total, order) => total + (order.total_amount || 0), 0);
                    const pendingOrders = ordersData.filter(o => ['pending_payment', 'processing', 'shipped'].includes(o.status)).length;
                    const deliveredOrders = ordersData.filter(o => o.status === 'delivered').length;
                    setOrderStats({ total: totalSpent, pending: pendingOrders, delivered: deliveredOrders });

                } catch (error) {
                    console.error("Erro ao carregar pedidos para o perfil:", error);
                }
            }
            setLoadingPageData(false);
        };

        if (!authLoading) {
            loadPageData();
        }
    }, [userProfile, authLoading]);

    // Handlers para cada formulário
    const handleContactChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    const handleEmailChange = (e) => setEmailData({ ...emailData, [e.target.name]: e.target.value });

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactError(''); setContactSuccess(''); setSavingContact(true);
        try {
            await updateProfile(userProfile.id, formData);
            setContactSuccess('Informações atualizadas com sucesso!');
            setTimeout(() => setContactSuccess(''), 3000);
        } catch (error) {
            setContactError('Erro ao atualizar informações.');
        } finally {
            setSavingContact(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError(''); setPasswordSuccess('');
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('As novas senhas não coincidem.');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }
        setSavingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
            if (error) throw error;
            setPasswordSuccess('Senha alterada com sucesso!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (error) {
            setPasswordError(error.message || 'Erro ao alterar a senha.');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setEmailError(''); setEmailSuccess('');
        if (emailData.newEmail !== emailData.confirmEmail) {
            setEmailError('Os emails não coincidem.');
            return;
        }
        setSavingEmail(true);
        try {
            const { error } = await supabase.auth.updateUser({ email: emailData.newEmail });
            if (error) throw error;
            setEmailSuccess('Alteração de email solicitada. Por favor, verifique seu email antigo e o novo para confirmar a mudança.');
            setEmailData({ newEmail: '', confirmEmail: '' });
        } catch (error) {
            setEmailError(error.message || 'Erro ao solicitar alteração de email.');
        } finally {
            setSavingEmail(false);
        }
    };

    const handleImageClick = () => {
        // Esta função simplesmente aciona o clique no input de arquivo que está escondido.
        fileInputRef.current.click();
    };

    const handleImageChange = async (e) => {
        // Pega o arquivo que o usuário selecionou.
        const file = e.target.files[0];
        if (!file || !userProfile) return;

        setUploadingImage(true);
        setError(''); // Limpa erros anteriores

        try {
            // Cria um nome de arquivo único usando o ID do usuário para evitar conflitos e facilitar o gerenciamento.
            const fileExt = file.name.split('.').pop();
            const filePath = `${userProfile.id}.${fileExt}`;

            // Faz o upload para o bucket 'avatars' no Supabase Storage.
            // 'upsert: true' permite que a imagem seja substituída se já existir uma com o mesmo nome.
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            // Pega a URL pública do arquivo que acabamos de enviar.
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            // Adicionamos um timestamp à URL para evitar problemas de cache do navegador.
            const publicUrl = `${data.publicUrl}?t=${new Date().getTime()}`;

            // Atualiza a coluna 'avatar_url' na nossa tabela 'profiles'.
            await updateProfile(userProfile.id, { avatar_url: publicUrl });

            // Recarrega a página para que todas as partes do app vejam a nova imagem.
            window.location.reload();

        } catch (error) {
            console.error("Erro ao atualizar imagem:", error);
            setError('Erro ao atualizar imagem. Por favor, tente novamente.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = async () => {
        // Verifica se realmente existe uma imagem para apagar.
        if (!userProfile?.avatar_url) return;

        // Pede confirmação ao usuário antes de apagar.
        if (window.confirm("Tem certeza que deseja remover sua foto de perfil?")) {
            try {
                // Chama a função do nosso serviço que apaga a imagem do Storage e do banco de dados.
                await deleteProfileImage(userProfile.id, userProfile.avatar_url);

                // Recarrega a página para mostrar a mudança (o avatar com as iniciais).
                window.location.reload();
            } catch (error) {
                console.error("Erro ao apagar imagem:", error);
                setError("Falha ao remover a imagem. Tente novamente.");
            }
        }
    };
    const handleLogout = async () => { /* ... */ };
    const getInitials = (name) => { /* ... */ };


    if (authLoading || loadingPageData) {
        return <div className="container mx-auto px-4 py-10">Carregando perfil...</div>;
    }
    if (!userProfile) {
        return <div className="container mx-auto px-4 py-10">Você precisa estar logado para ver esta página.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Perfil do Usuário</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna da Esquerda (Informações Pessoais e Histórico) */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-4"><CardTitle>Informações Pessoais</CardTitle></CardHeader>
                            <CardContent className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <Avatar className="h-28 w-28 cursor-pointer relative group" onClick={handleImageClick}>
                                        <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name} />
                                        <AvatarFallback className="text-2xl bg-green-100 text-green-800">{getInitials(userProfile.full_name)}</AvatarFallback>
                                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            {uploadingImage ? <Loader2 className="h-8 w-8 text-white animate-spin" /> : <Camera className="h-8 w-8 text-white" />}
                                        </div>

                                    </Avatar>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                    {userProfile.avatar_url && (
                                        <Button variant="destructive" size="sm" className="absolute bottom-0 right-0 rounded-full p-1.5 h-auto" onClick={handleDeleteImage}>
                                            <CameraOff className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>

                                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                                <h2 className="text-xl font-bold">{userProfile.full_name}</h2>
                                <p className="text-gray-500 mb-2">{session?.user?.email}</p>
                                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 mt-4" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 mr-2" />Sair
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-4"><CardTitle>Histórico de Compras</CardTitle></CardHeader>
                            <CardContent>
                                {loadingPageData ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between"><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-8" /></div>
                                        <div className="flex items-center justify-between"><Skeleton className="h-5 w-28" /><Skeleton className="h-5 w-8" /></div>
                                        <div className="flex items-center justify-between"><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-8" /></div>
                                        <Separator />
                                        <div className="flex items-center justify-between"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-16" /></div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                                            <div className="flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-full"><Package className="h-4 w-4 text-blue-600" /></div><span>Total de Pedidos</span></div><span className="font-bold">{orders.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                                            <div className="flex items-center gap-3"><div className="bg-yellow-100 p-2 rounded-full"><Package className="h-4 w-4 text-yellow-600" /></div><span>Pedidos Pendentes</span></div><span className="font-bold">{orderStats.pending}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                                            <div className="flex items-center gap-3"><div className="bg-green-100 p-2 rounded-full"><Package className="h-4 w-4 text-green-600" /></div><span>Pedidos Entregues</span></div><span className="font-bold">{orderStats.delivered}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between font-bold"><span>Total Gasto</span><span className="text-green-700">R$ {orderStats.total.toFixed(2)}</span></div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna da Direita (Formulários de Edição) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Formulário de Contato */}
                        <Card>
                            <CardHeader><CardTitle>Editar Informações de Contato</CardTitle></CardHeader>
                            <CardContent>
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    {contactError && <div className="text-red-500 text-sm">{contactError}</div>}
                                    {contactSuccess && <div className="text-green-600 text-sm">{contactSuccess}</div>}
                                    <div>
                                        <Label htmlFor="phone" className="flex items-center gap-2 mb-1"><Phone className="h-4 w-4" />Telefone</Label>
                                        <Input id="phone" name="phone" value={formData.phone} onChange={handleContactChange} placeholder="(99) 99999-9999" />
                                    </div>
                                    <div>
                                        <Label htmlFor="address" className="flex items-center gap-2 mb-1"><MapPin className="h-4 w-4" />Endereço Completo</Label>
                                        <Textarea id="address" name="address" value={formData.address} onChange={handleContactChange} placeholder="Rua, número, bairro, cidade, estado, CEP" rows={3} />
                                    </div>
                                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={savingContact}>
                                        {savingContact ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Salvar Contato</>}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Formulário de Alterar Email */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Alterar Email</CardTitle>
                                <CardDescription>O email atual é {session?.user?.email}. Você receberá um link de confirmação no seu email antigo e no novo.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    {emailError && <div className="text-red-500 text-sm">{emailError}</div>}
                                    {emailSuccess && <div className="text-green-600 text-sm">{emailSuccess}</div>}
                                    <div>
                                        <Label htmlFor="newEmail" className="flex items-center gap-2 mb-1"><MailIcon className="h-4 w-4" />Novo Email</Label>
                                        <Input id="newEmail" name="newEmail" type="email" value={emailData.newEmail} onChange={handleEmailChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="confirmEmail" className="flex items-center gap-2 mb-1"><MailIcon className="h-4 w-4" />Confirme o Novo Email</Label>
                                        <Input id="confirmEmail" name="confirmEmail" type="email" value={emailData.confirmEmail} onChange={handleEmailChange} required />
                                    </div>
                                    <Button type="submit" variant="outline" disabled={savingEmail}>
                                        {savingEmail ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Solicitando...</> : 'Solicitar Alteração de Email'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Formulário de Alterar Senha */}
                        <Card>
                            <CardHeader><CardTitle>Alterar Senha</CardTitle></CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
                                    {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
                                    {/* A verificação da senha atual foi removida para simplificar, pois 'updateUser' não a exige. */}
                                    <div>
                                        <Label htmlFor="newPassword" className="flex items-center gap-2 mb-1"><KeyRound className="h-4 w-4" />Nova Senha</Label>
                                        <Input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-1"><KeyRound className="h-4 w-4" />Confirme a Nova Senha</Label>
                                        <Input id="confirmPassword" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                                    </div>
                                    <Button type="submit" variant="outline" disabled={savingPassword}>
                                        {savingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Alterando...</> : 'Alterar Senha'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}