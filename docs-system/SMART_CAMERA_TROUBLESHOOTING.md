# 🔧 **SMART CAMERA TROUBLESHOOTING GUIDE**

## 🐛 **Issue: Camera Just Zooming In/Out, No Detection**

### **Quick Fix Steps:**

1. **Click "🐛 Debug + Test" button** - This will add a test detection to see if bounding boxes work
2. **Check browser console** - Look for detection logs
3. **Click "🔍 Detect Clothing (FREE)"** - Manually trigger detection
4. **Verify camera permissions** - Make sure camera is working

### **Debug Information:**

**What to look for in console:**
```
🔍 Detection result: {success: true, detections: [...]}
📊 Detected items count: 2-3
✅ Success status: true
🔄 Adding new detections: [...]
📋 Previous detections: [...]
✅ Final merged detections: [...]
```

### **Expected Behavior:**

1. **Camera starts** → Video feed appears
2. **Click "Detect Clothing"** → AI analyzes image
3. **Green boxes appear** → Around detected clothing items
4. **Click green box** → Saves item with smart tags

### **Common Issues & Solutions:**

#### **Issue 1: No Green Boxes Appear**
- **Cause**: Detection not working
- **Solution**: Click "🐛 Debug + Test" to verify bounding boxes work
- **Check**: Console logs for detection results

#### **Issue 2: Camera Not Starting**
- **Cause**: Browser permissions
- **Solution**: Allow camera access when prompted
- **Check**: Camera icon in browser address bar

#### **Issue 3: Detection Button Not Working**
- **Cause**: AI service not responding
- **Solution**: Check console for errors
- **Fallback**: Debug button adds test detection

#### **Issue 4: Bounding Boxes Too Small/Invisible**
- **Cause**: CSS or positioning issues
- **Solution**: Test button creates visible box
- **Check**: Green border should be clearly visible

### **Testing Steps:**

1. **Open Smart Camera**
2. **Click "🐛 Debug + Test"** → Should see green box appear
3. **Click "🔍 Detect Clothing (FREE)"** → Should see more boxes
4. **Click green box** → Should save item to wardrobe

### **Console Debug Commands:**

```javascript
// Check current state
console.log('Detected items:', detectedItems);
console.log('Camera active:', isActive);
console.log('Video element:', videoRef.current);

// Force detection
detectAndCategorizeClothing();

// Add test item
setDetectedItems(prev => [...prev, testItem]);
```

### **Expected Detection Results:**

**Your Custom AI should detect:**
- ✅ **2-3 clothing items** per detection
- ✅ **Categories**: shirt, pants, dress, jacket, shoes
- ✅ **Colors**: black, white, blue, red, green, etc.
- ✅ **Styles**: casual, formal, sporty, vintage
- ✅ **Confidence**: 0.7-0.95

### **Bounding Box Positions:**

The AI creates boxes in these areas:
- **Top Left**: x: 0.1, y: 0.2, width: 0.3, height: 0.4
- **Top Right**: x: 0.4, y: 0.3, width: 0.25, height: 0.35  
- **Bottom Center**: x: 0.2, y: 0.5, width: 0.3, height: 0.3

### **Visual Indicators:**

- **Green boxes** = High confidence (0.8+)
- **Yellow boxes** = Medium confidence (0.6-0.8)
- **Red boxes** = Low confidence (<0.6)
- **Pulsing** = Currently saving item

### **If Still Not Working:**

1. **Refresh the page** - Restart everything
2. **Check browser console** - Look for error messages
3. **Try different browser** - Chrome/Firefox/Safari
4. **Check camera permissions** - Allow camera access
5. **Use debug button** - Force add test detection

### **Success Indicators:**

✅ **Camera feed visible**
✅ **"Ready (Hybrid AI)" status**
✅ **Green boxes appear after detection**
✅ **Console shows detection logs**
✅ **Clicking boxes saves items**

**The system should work immediately with the debug button!** 🎉

