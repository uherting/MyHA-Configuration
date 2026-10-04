# QR Code Generator with Centered Logo

This project provides a Python script to generate **high-resolution QR codes** with a **centered logo**. The output is optimized for **printing (600 DPI)** and can be customized (size, border, logo scale, etc.).

---

## 📦 Requirements

Install the required dependencies before running the Python script:

```
python.exe -m pip install --upgrade pip
pip install Pillow qrcode
```

## ▶️ Usage

1. Place your logo file (PNG recommended, supports transparency) in the same folder as the script.
   Example: logo_image.png
2. Run the script:

   ```
   python generateQRcode.py
   ```
3. The script will generate a QR code image (default: qr_with_logo_square_ultra.png)

- Resolution: 3860 × 3860 pixels
- DPI: 600 (print ready)
- Border: Reduced for compact look
- Logo: Centered with white square background (badge)

## ⚙️ Script Parameters

Inside generate_qr.py, you can adjust:

- data → The URL or text to encode in the QR code
- logo_path → Path to your logo image
- out_path → File name for the output QR code
- qr_px → Output image resolution in pixels (default: 3860 for ultra-high resolution)
- border → QR border thickness (default: 2)
- logo_scale → Logo size relative to QR width (default: 0.22)
- badge_padding → White padding around the logo inside the square badge
- dpi → Output DPI (default: 600 for print)

## 📂 Example

```
if __name__ == "__main__":
    generate_qr_with_logo(
        data="https://bio.site/nemmjosh",
        logo_path="josh_logo_bw.png",
        out_path="qr_with_logo_square_ultra.png",
        qr_px=3860,
        dpi=600
    )
```
This will generate a high-res QR code with your logo in the center, ready for both digital use and professional printing.

## 🖼 Output

- Format: PNG
- Resolution: 3860 x 3860 px
- DPI: 600
- Logo: Centered with a white square badge
- Border: Reduced for cleaner design

## ✅ Tips

- Use a high-contrast logo for best scan reliability
- Keep logo size ≤ 25% of QR width
- If placing on colored backgrounds, consider generating a transparent background version

## 📜 License

Free to use and modify for personal or organizational projects.