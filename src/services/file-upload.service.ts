import { apiClient } from './apiClient';
import { pick, keepLocalCopy } from '@react-native-documents/picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { SelectedFile, TemporaryFileResponse } from '../types/ticket.types';

class FileUploadService {

    async uploadTemporaryFile(fileUri: string, fileName: string, fileType: string): Promise<TemporaryFileResponse> {
        const formData = new FormData();

        formData.append('file', {
            uri: fileUri,
            name: fileName,
            type: fileType,
        });

        try {
            const response = await apiClient.post('/File/TemporaryUpload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    async pickFile(): Promise<{ uri: string; name: string; type: string } | null> {
        try {
            const result = await pick();

            if (result && result.length > 0) {
                return {
                    uri: result[0].uri,
                    name: result[0].name || 'test',
                    type: result[0].type || 'application/octet-stream',
                };
            }
        } catch (err) {
            console.error('Error picking file:', err);
        }
        return null;
    }

    async pickImage(): Promise<{ uri: string; name: string; type: string } | null> {
        return new Promise((resolve) => {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    includeBase64: false,
                    quality: 0.8,
                },
                (response) => {
                    if (response.assets && response.assets[0]) {
                        const asset = response.assets[0];
                        resolve({
                            uri: asset.uri!,
                            name: asset.fileName || `image_${Date.now()}.jpg`,
                            type: asset.type || 'image/jpeg',
                        });
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }

    async takePhoto(): Promise<{ uri: string; name: string; type: string } | null> {
        return new Promise((resolve) => {
            launchCamera(
                {
                    mediaType: 'photo',
                    includeBase64: false,
                    quality: 0.8,
                    saveToPhotos: true,
                },
                (response) => {
                    if (response.assets && response.assets[0]) {
                        const asset = response.assets[0];
                        resolve({
                            uri: asset.uri!,
                            name: asset.fileName || `photo_${Date.now()}.jpg`,
                            type: asset.type || 'image/jpeg',
                        });
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }

    /*
    async getFileBase64(uri: string): Promise<string> { 
        try {
            const base64 = await RNFS.readFile(uri, 'base64');
            return base64;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }*/

    async getFileBase64(uri: string): Promise<string> {
        const response = await fetch(uri);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    async getFileSize(uri: string): Promise<number> {
        const response = await fetch(uri, { method: 'HEAD' });
        const size = response.headers.get('Content-Length');
        return size ? parseInt(size, 10) : 0;
    };
}

export default new FileUploadService();