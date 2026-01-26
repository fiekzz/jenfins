import * as qr from 'qr-image'

export async function qrcodeGenerator(data: string): Promise<File | undefined> {
    try {

        // Generate QR code as PNG buffer
        const qrBuffer = qr.imageSync(data, { 
            type: 'png',
            size: 10,
            margin: 1,
            ec_level: 'H'
        })

        // Convert buffer to Uint8Array for Blob compatibility
        const uint8Array = new Uint8Array(qrBuffer as Buffer)
        const blob = new Blob([uint8Array], { type: 'image/png' })
        return new File([blob], 'qrcode.png', { type: 'image/png' })

    } catch (error) {

        console.error('Error generating QR code:', error);
        return undefined;

    }
}