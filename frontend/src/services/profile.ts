import api from './api';

export type UpdateProfilePayload = {
    login?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
};

export const getMyProfile = async () => {
    const response = await api.get('/user/me');
    return response.data;
};

export const updateMyProfile = async (payload: UpdateProfilePayload) => {
    const response = await api.patch('/user/me', payload);
    return response.data;
};

export const uploadMyAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.patch('/user/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data'},
    });
    return response.data
}

export const deleteMyAccount = async () => {
    await api.delete('/user/me');
};