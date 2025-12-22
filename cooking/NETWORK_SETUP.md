# Network Setup Guide

## ⚠️ IMPORTANT: Update Your IP Address

Your app needs to know your computer's IP address to connect to the backend server.

### Step 1: Find Your IP Address

**On Windows:**
1. Open Command Prompt or PowerShell
2. Type: `ipconfig`
3. Look for **"IPv4 Address"** under your active network adapter (usually "Wireless LAN adapter Wi-Fi" or "Ethernet adapter")
4. Copy that IP address (e.g., `192.168.1.105` or `192.168.0.100`)

**On Mac/Linux:**
1. Open Terminal
2. Type: `ifconfig` (or `ip addr` on Linux)
3. Look for your network interface (usually `en0` for Wi-Fi or `eth0` for Ethernet)
4. Find the `inet` address (e.g., `192.168.1.105`)

### Step 2: Update the IP in Your Code

1. Open: `cooking/utils/getApiUrl.ts`
2. Find this line:
   ```typescript
   const YOUR_IP = '192.168.1.100'; // ⚠️ CHANGE THIS
   ```
3. Replace `192.168.1.100` with your actual IP address from Step 1

### Step 3: Make Sure Backend is Running

1. Open a terminal in the `backend` folder
2. Run: `npm run dev`
3. You should see: `🚀 Server running on port 5000`
4. If you see MongoDB connection errors, check your `.env` file

### Step 4: Test the Connection

1. Make sure your phone and computer are on the **same Wi-Fi network**
2. Start the Expo app
3. Try to create an account or login
4. If it still fails, check:
   - Is the backend server running?
   - Is your IP address correct?
   - Are you on the same Wi-Fi network?
   - Is Windows Firewall blocking the connection?

### Android Emulator Users

If you're using Android Emulator, you can use `10.0.2.2` instead of your IP:
```typescript
if (Platform.OS === 'android' && __DEV__) {
  return 'http://10.0.2.2:5000/api';
}
```

### Troubleshooting Network Errors

**Error: "Network request failed"**
- ✅ Check backend is running (`npm run dev` in backend folder)
- ✅ Verify IP address is correct in `getApiUrl.ts`
- ✅ Ensure phone and computer are on same Wi-Fi
- ✅ Try disabling Windows Firewall temporarily to test
- ✅ Check backend CORS settings (should allow all origins in development)

**Error: "Cannot connect to backend"**
- Check if backend is accessible from your browser: `http://YOUR_IP:5000`
- If it works in browser but not in app, check the IP address in `getApiUrl.ts`

