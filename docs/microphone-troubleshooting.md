# Microphone Troubleshooting Guide for LegalEase Chrome Extension

If you're experiencing issues with the microphone in the LegalEase Chrome Extension, follow these troubleshooting steps:

## Common Errors

### "Failed to start recording" or "Error accessing microphone"

This typically occurs when Chrome doesn't have permission to use your microphone.

#### Solution:

1. **Check Chrome's Site Permissions**
   - Click the padlock/info icon in the address bar when on Google Meet
   - Click on "Site Settings"
   - Make sure "Microphone" is set to "Allow"

2. **Check Chrome's Extension Permissions**
   - Go to `chrome://extensions/` in your browser
   - Find "LegalEase Meet Assistant" 
   - Click "Details"
   - Ensure "Site access" includes permission for Google Meet
   - Make sure "Microphone" permission is granted

3. **Restart Chrome & Google Meet**
   - After changing permissions, close and reopen Chrome
   - Navigate back to your Google Meet session

### "MediaRecorder is not supported" or "Cannot record audio"

This may happen if your browser version is outdated or doesn't support the MediaRecorder API.

#### Solution:

1. **Update Chrome**
   - Go to Chrome menu (three dots) > Help > About Google Chrome
   - Chrome will automatically check for and install updates
   - Restart Chrome after updating

2. **Check if another app is using the microphone**
   - Close other applications that might be using your microphone
   - Try again after closing these applications

### "No microphone found" error

This occurs when Chrome cannot detect any microphones connected to your device.

#### Solution:

1. **Check your microphone connection**
   - Ensure your microphone is properly connected
   - For external microphones, try a different USB port

2. **Check system settings**
   - Go to your operating system's sound settings
   - Make sure the correct microphone is selected as default
   - Check that the microphone is not muted or disabled

3. **Test your microphone in Google Meet directly**
   - Click on the three dots in Google Meet
   - Go to Settings > Audio
   - Test if your microphone works in Google Meet's own interface

## Still Having Issues?

If you've tried all these steps and are still experiencing problems:

1. Try using a different microphone if available
2. Try the extension on a different computer
3. Check the Chrome console (F12) for specific error messages
4. Contact support with details about your issue and any error messages

## Reporting Issues

When reporting issues, please include:
- The exact error message you see
- Your Chrome version
- Your operating system
- Steps you've already taken to troubleshoot
- Any specific patterns (does it happen every time, or only sometimes?)
