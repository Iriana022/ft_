import api from './api';

export type UpdateProfilePayload = {
    login?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
};

const uploadsApiPrefix = '/api/uploads/';

const isAbsoluteHttpUrl = (value: string) => /^https?:\/\//i.test(value);

export const normalizeAvatarUrl = (avatar?: string | null): string | undefined => {
    if (!avatar) return undefined;

    const value = avatar.trim();
    if (!value) return undefined;

    let pathname = value;
    if (isAbsoluteHttpUrl(value)) {
        try {
            pathname = new URL(value).pathname;
        } catch {
            return undefined;
        }
    }

    if (pathname.startsWith('/assets/')) return pathname;
    if (pathname.startsWith(uploadsApiPrefix)) return pathname;
    if (pathname.startsWith('/uploads/')) return '/api' + pathname;
    if (pathname.startsWith('/')) return pathname;
    if (pathname.startsWith('avatar-')) return uploadsApiPrefix + pathname;

    return value;
};

const normalizeProfileResponse = <T extends { avatar?: string | null }>(data: T): T => {
    return {
        ...data,
        avatar: normalizeAvatarUrl(data.avatar),
    };
};

export const getMyProfile = async () => {
    const response = await api.get('/user/me');
    return normalizeProfileResponse(response.data);
};

export const updateMyProfile = async (payload: UpdateProfilePayload) => {
    const response = await api.patch('/user/me', payload);
    return normalizeProfileResponse(response.data);
};

export const uploadMyAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.patch('/user/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data'},
    });
    return normalizeProfileResponse(response.data);
}

export const deleteMyAccount = async () => {
    await api.delete('/user/me');
};