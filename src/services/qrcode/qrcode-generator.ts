import { toDataURL } from 'qrcode'

export async function qrcodeGenerator(data: string): Promise<File | undefined> {
    try {

        const dataUrl = await toDataURL(data, { errorCorrectionLevel: 'H' })

        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // 3. Return as a standard File object
        return new File([blob], 'qrcode.png', { type: 'image/png' });

    } catch (error) {

        console.error('Error generating QR code:', error);
        return undefined;

    }
}