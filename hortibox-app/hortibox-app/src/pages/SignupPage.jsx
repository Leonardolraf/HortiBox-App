import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'; // Para selecionar o tipo de conta

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [userType, setUserType] = useState('customer'); // Começa como 'cliente' por padrão
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');

        let metadata = {
            full_name: fullName,
            user_type: userType,
        };
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: metadata
                }
            });

            if (error) throw error;

            if (data.user) {
                setMessage('Cadastro realizado! Por favor, verifique seu email para confirmar sua conta.');
            }

        } catch (err) {
            setError(err.message || 'Ocorreu um erro ao se cadastrar.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Criar uma Conta</CardTitle>
                    <CardDescription>
                        Escolha seu tipo de perfil e preencha os dados.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="grid gap-6">
                        {/* SELEÇÃO DE TIPO DE CONTA */}
                        <div className="grid gap-2">
                            <Label>Eu sou um...</Label>
                            <RadioGroup defaultValue="customer" onValueChange={setUserType} className="grid grid-cols-2 gap-4">
                                <div>
                                    <RadioGroupItem value="customer" id="customer" className="peer sr-only" />
                                    <Label htmlFor="customer" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                        Cliente
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="supplier" id="supplier" className="peer sr-only" />
                                    <Label htmlFor="supplier" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                        Fornecedor
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* CAMPOS COMUNS */}
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha (mínimo 6 caracteres)</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>

                        {userType === 'customer' && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(99) 99999-9999" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cpf">CPF</Label>
                                    <Input id="cpf" type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" required />
                                </div>
                            </>
                        )}

                        {userType === 'supplier' && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="companyName">Nome Social da Empresa</Label>
                                    <Input id="companyName" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <Input id="cnpj" type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" required />
                                </div>
                            </>
                        )}

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {message && <p className="text-green-600 text-sm">{message}</p>}
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                        </Button>
                        <p className="mt-4 text-xs text-center text-gray-700">
                            Já tem uma conta?{" "}
                            <Link to="/login" className="underline">Faça login</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}