import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
    try {
        const qr = await QRCode.toDataURL(data);
        return qr;
    } catch (error) {
        throw new Error('Failed to generate QR code');
    }
};