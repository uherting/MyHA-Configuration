import qrcode
from PIL import Image

def create_wifi_qr(ssid, password, auth_type="WPA", hidden=False, filename="wifi_qr.png", resolution=3860, border=1):
    """
    Generate a custom high-resolution Wi-Fi QR Code with reduced border.

    Parameters:
        ssid (str): Wi-Fi SSID (network name)
        password (str): Wi-Fi password
        auth_type (str): Authentication type - "WPA", "WEP", or "nopass"
        hidden (bool): True if the network is hidden
        filename (str): Output filename for the QR code image
        resolution (int): Final resolution (square) in pixels
        border (int): Border size around the QR code
    """
    # Wi-Fi QR Code format
    wifi_config = f"WIFI:T:{auth_type};S:{ssid};P:{password};H:{'true' if hidden else 'false'};;"

    # Generate QR code with reduced border
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=border,
    )
    qr.add_data(wifi_config)
    qr.make(fit=True)

    # Create QR image
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")

    # Resize to desired resolution (e.g., 3860x3860)
    img = img.resize((resolution, resolution), Image.Resampling.NEAREST)

    # Save image
    img.save(filename, dpi=(300, 300))
    print(f"✅ Wi-Fi QR Code saved as {filename} with {resolution}x{resolution}px resolution")

# Example usage
if __name__ == "__main__":
    create_wifi_qr("ABCD", "ABCD", resolution=3860, border=1)
