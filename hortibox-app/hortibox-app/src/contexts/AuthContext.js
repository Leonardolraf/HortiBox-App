import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => subscription.unsubscribe();
    }, []);


    useEffect(() => {
        if (!session?.user) {
            setUserProfile(null);
            return;
        }
        supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data, error }) => {
                if (error && error.code !== 'PGRST116') {
                    console.error("Erro ao buscar perfil:", error);
                } else {
                    setUserProfile(data);
                }
            });

    }, [session]);


    const value = useMemo(() => ({
        session,
        userProfile,
        loading
    }), [session, userProfile, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}