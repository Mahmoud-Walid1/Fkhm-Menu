/**
 * Uploads an image to Cloudinary using unsigned upload.
 * @param file The image file to upload
 * @param cloudName The Cloudinary cloud name
 * @param uploadPreset The unsigned upload preset
 * @returns Promise resolving to the secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (
    file: File,
    cloudName: string,
    uploadPreset: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!cloudName || !uploadPreset) {
        return { success: false, error: 'Cloud Name or Upload Preset is missing.' };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return { success: true, url: data.secure_url };
    } catch (error: any) {
        console.error('Cloudinary Upload Error:', error);
        return { success: false, error: error.message || 'Unknown error occurred during upload' };
    }
};
