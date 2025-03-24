# 📱 Mobile Live Preview - VS Code Extension

**Mobile Live Preview** is a Visual Studio Code extension that allows you to preview your website inside a mobile frame directly within VS Code. Speed up your responsive design workflow by simulating how your app would look on mobile devices without switching to a browser.

---

## ✨ Features

- 📱 Mobile frame simulation (e.g., iPhone 14 Pro)
- 🎨 Custom background color picker
- 🖼️ QR code generation to preview the app on your physical phone
- 🔄 Auto-reload when you save files
- 🌐 Local web server (no need for additional live-server extensions)

---

## 🚀 How it works

1. Right-click an `.html` file and select **"Open in Mobile Live Preview"**.
2. A new panel opens with your app inside a mobile frame.
3. You can scan the QR code to preview your app on your phone.

---

## ⚠️ Disclaimer

> The mobile preview inside this extension aims to simulate a mobile device, but it **does not exactly match** a real device environment or native app behavior.
>
> Your app may display:
>
> - Black bars (status bar, safe areas) on a real mobile browser.
> - Slightly different scroll or viewport behavior in a native wrapper.

**This extension is meant for quick visual checks and prototyping, not as a replacement for real-device testing.**

---

## 📡 Local Network QR Code

To preview your app on your mobile device, make sure:

- Your PC and phone are connected to the same Wi-Fi network.
- The QR code points to your **local IP** (e.g., `http://192.168.x.x:3000`).

---

## 💡 Future Improvements

- Support for more device frames (Android, iPad, iPhones, etc.).
- Advanced network settings for QR generation.
