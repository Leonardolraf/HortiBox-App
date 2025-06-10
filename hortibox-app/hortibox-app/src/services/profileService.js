// src/services/profileService.js
import { supabase } from '../supabaseClient';

export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // Ignora o erro "PGRST116" (não encontrado)
        console.error('Erro ao buscar perfil:', error);
        throw error;
    }
    return data;
};

export const updateProfile = async (userId, profileData) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
    }
    return data;
};

export const listAllProfiles = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Erro ao listar perfis:', error);
        throw error;
    }
    return data;
}

/**
 * Deleta a imagem de perfil de um usuário do Storage e atualiza o perfil no banco de dados.
 * @param {string} userId - O ID do usuário.
 * @param {string} avatarUrl - A URL completa da imagem a ser deletada.
 * @returns {Promise<object>} O perfil do usuário atualizado.
 */
export const deleteProfileImage = async (userId, avatarUrl) => {
    if (!avatarUrl) return; // Não faz nada se não houver imagem

    try {
        // Extrai o nome do arquivo da URL completa
        const filePath = avatarUrl.split('/avatars/')[1];

        if (!filePath) {
            throw new Error("Caminho do arquivo de avatar inválido.");
        }

        // Remove o arquivo do Supabase Storage
        const { error: removeError } = await supabase.storage
            .from('avatars')
            .remove([filePath]);

        if (removeError) throw removeError;

        // Atualiza a coluna 'avatar_url' na tabela 'profiles' para nulo
        // Reutilizando assim a função updateProfile que já existe
        const updatedProfile = await updateProfile(userId, { avatar_url: null });
        return updatedProfile;

    } catch (error) {
        console.error("Erro ao deletar imagem de perfil:", error);
        throw error;
    }
};