/**
 * GitHub Image Upload Utility
 * Uploads images to GitHub repository using the Contents API
 */

export interface GitHubUploadConfig {
    token: string;
    owner: string;
    repo: string;
    branch?: string;
}

export interface GitHubUploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Generate a unique filename with timestamp
 */
function generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || 'jpg';
    const sanitized = originalName
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars
        .substring(0, 20); // Limit length

    return `${timestamp}_${sanitized}.${extension}`;
}

/**
 * Upload image file to GitHub repository
 * 
 * @param file - Image file to upload
 * @param config - GitHub configuration (token, owner, repo, branch)
 * @param folder - Folder path in repo (default: 'images/products')
 * @returns Upload result with URL or error
 */
export async function uploadImageToGitHub(
    file: File,
    config: GitHubUploadConfig,
    folder: string = 'images/products'
): Promise<GitHubUploadResult> {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            return {
                success: false,
                error: 'الملف المختار ليس صورة. يرجى اختيار صورة (JPG, PNG, إلخ)'
            };
        }

        // Validate file size (max 1MB for GitHub API comfort)
        const maxSize = 1024 * 1024; // 1MB
        if (file.size > maxSize) {
            return {
                success: false,
                error: 'حجم الصورة كبير جداً. الحد الأقصى 1 ميجابايت'
            };
        }

        // Convert to base64
        const base64Content = await fileToBase64(file);

        // Generate unique filename
        const filename = generateFilename(file.name);
        const path = `${folder}/${filename}`;

        // GitHub API endpoint
        const { owner, repo, branch = 'main', token } = config;
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

        // Create commit message
        const message = `Add product image: ${filename}`;

        // Upload to GitHub
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message,
                content: base64Content,
                branch
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('GitHub API Error:', errorData);

            if (response.status === 401) {
                return {
                    success: false,
                    error: 'رمز GitHub غير صحيح. يرجى التحقق من الإعدادات'
                };
            }

            return {
                success: false,
                error: `فشل الرفع: ${errorData.message || response.statusText}`
            };
        }

        const data = await response.json();

        // Get raw content URL (direct image link)
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

        return {
            success: true,
            url: rawUrl
        };

    } catch (error) {
        console.error('Upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة'
        };
    }
}

/**
 * Validate GitHub token by testing API access
 */
export async function validateGitHubToken(
    token: string,
    owner: string,
    repo: string
): Promise<{ valid: boolean; error?: string }> {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            return { valid: true };
        }

        if (response.status === 401) {
            return { valid: false, error: 'رمز GitHub غير صحيح' };
        }

        if (response.status === 404) {
            return { valid: false, error: 'المستودع غير موجود أو لا يمكن الوصول إليه' };
        }

        return { valid: false, error: 'فشل التحقق من الرمز' };
    } catch (error) {
        return { valid: false, error: 'خطأ في الاتصال بـ GitHub' };
    }
}
