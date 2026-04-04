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