# 👤 User Guide

**Version**: 1.0  
**Last Updated**: 2026-01-02

---

## 📋 Welcome

Welcome to **Runware Generator** - a desktop application for AI-powered image and video generation using the Runware AI platform.

---

## 🚀 Getting Started

### System Requirements

- **OS**: Windows 10/11 (macOS and Linux coming soon)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for app, additional for generated images
- **Internet**: Required for AI generation

### Installation

1. **Download**
   - Download the installer from GitHub releases
   - Run `Runware-Generator-Setup.exe`

2. **Install**
   - Follow the installation wizard
   - Choose installation location
   - Create desktop shortcut (recommended)

3. **Launch**
   - Double-click the desktop icon
   - Or launch from Start Menu

4. **First-Time Setup**
   - Enter your Runware API key
   - Get your key at https://runware.ai/
   - Choose storage location for generated images

---

## 🎨 Your First Image

### Step 1: Enter a Prompt

1. Click on the "Generate" tab
2. In the text box, describe the image you want:
   ```
   A beautiful sunset over mountains, vibrant colors, digital art
   ```

### Step 2: Adjust Settings (Optional)

**Size**: Choose resolution

- 512x512 (fast, lower quality)
- 768x768 (balanced)
- 1024x1024 (slow, higher quality)

**Steps**: Generation quality

- 15-20: Fast, draft quality
- 25-30: Standard quality
- 40-50: High quality, slow

**Guidance Scale**: How closely to follow prompt

- 5.0: Creative, more variation
- 7.5: Balanced (default)
- 12.0: Strict adherence to prompt

**Seed**: Random or fixed

- Random (default): Different image each time
- Fixed: Use same seed to reproduce result

**Negative Prompt**: What to avoid

```
blurry, low quality, distorted, ugly
```

### Step 3: Generate

1. Click the **Generate** button
2. Wait 3-10 seconds depending on settings
3. View your generated image!

### Step 4: Save or Regenerate

- **Save**: Click download button to save locally
- **Regenerate**: Click generate again with same settings
- **New Image**: Change prompt or settings

---

## 📚 History Management

### View History

1. Click the "History" tab
2. See all your past generations
3. Search by prompt text
4. Filter by date

### Organize

- **View Details**: Click on an image to see settings
- **Delete**: Remove images you don't want
- **Export**: Export history to file (coming soon)

### Reuse

- **Load Settings**: Click on history item to load settings
- **Copy Prompt**: Copy prompt for reuse
- **Download**: Download image again

---

## ⚙️ Settings

### API Configuration

- **API Key**: Your Runware API key
  - Get at: https://runware.ai/
  - Required for generation

### Storage

- **Output Folder**: Where to save images
  - Default: Documents/RunwareGenerator/
  - Click "Browse" to change

### Default Parameters

Set your preferred defaults:

- Default resolution
- Default steps
- Default guidance scale

### Appearance

- **Theme**: Light or Dark (coming soon)
- **Language**: Select language (coming soon)

---

## 🎯 Tips for Better Results

### Writing Good Prompts

**Be Specific**

```
Good: A serene mountain lake at sunset, reflection, mountains in background, photorealistic, 8K
Bad: A lake
```

**Use Keywords**

```
digital art, photorealistic, oil painting, watercolor, sketch
```

**Style Descriptors**

```
cinematic, dramatic lighting, vibrant colors, muted tones
```

**Technical Terms**

```
8K, high resolution, detailed, sharp, clear
```

### Using Negative Prompts

**What to Avoid**

```
blurry, low quality, distorted, ugly, deformed, extra limbs
```

**Quality Issues**

```
pixelated, grainy, artifacts, watermark, text
```

**Style Issues**

```
cartoonish, oversaturated, washed out

### Advanced Techniques

**Weighting Keywords**
```

(beautiful landscape:1.3), (dramatic lighting:1.2), simple background:0.5

```

**Combining Styles**
```

photorealistic, cinematic lighting, 8K, highly detailed, masterpiece

```

**Iteration**
1. Generate basic image
2. Copy prompt
3. Add/remove keywords
4. Regenerate and compare

---

## 🎨 Common Use Cases

### Portraits

```

A professional portrait of a woman, studio lighting, sharp focus,
eyes looking at camera, 85mm lens, photorealistic

```

### Landscapes

```

A majestic mountain range at golden hour, dramatic clouds,
reflection in lake, photorealistic, 8K, detailed

```

### Fantasy Art

```

An enchanted forest with glowing mushrooms, magical atmosphere,
digital art, vibrant colors, highly detailed

```

### Product Photography

```

A smartphone on a wooden table, professional lighting,
soft shadows, product photography, white background

```

---

## 🐛 Troubleshooting

### Generation Fails

**Problem**: "API Error" or "Generation Failed"

**Solutions**:
1. Check internet connection
2. Verify API key is valid
3. Check API key in Settings
4. Try again (API might be busy)

### Slow Generation

**Problem**: Generation takes too long

**Solutions**:
1. Reduce resolution (try 512x512)
2. Reduce steps (try 20-25)
3. Check internet speed
4. Close other apps

### Poor Quality

**Problem**: Image looks bad

**Solutions**:
1. Write better prompt
2. Add negative prompt
3. Increase steps to 30-40
4. Increase guidance scale to 8.0-10.0
5. Try different seed

### App Won't Start

**Problem**: App crashes or won't open

**Solutions**:
1. Restart computer
2. Reinstall application
3. Check system requirements
4. Check for updates
5. Report bug on GitHub

### Images Not Saving

**Problem**: Can't find saved images

**Solutions**:
1. Check storage location in Settings
2. Ensure write permissions
3. Check disk space
4. Change storage folder

---

## 📞 Getting Help

### Documentation

- [Features Guide](FEATURES.md) - Learn about features
- [API Documentation](RUNWARE_SDK.md) - Learn about AI models

### Support

- **GitHub Issues**: Report bugs and request features
- **Discord/Slack**: Chat with community
- **Email**: support@example.com

### Tutorials

- Video tutorials (coming soon)
- Prompt examples (coming soon)
- Best practices guide (coming soon)

---

## 🔄 Updates

### Checking for Updates

1. Go to Settings
2. Click "Check for Updates"
3. Install if available

### Automatic Updates

- App checks for updates on launch
- You'll be notified when new version is available
- Updates are downloaded automatically

---

## ⚖️ Privacy & Security

### Data Stored

- **Locally**: All generated images stored on your computer
- **Cloud**: Prompts sent to Runware API (required for generation)
- **Settings**: Stored locally (API key encrypted)

### Data Not Shared

- We do not collect personal data
- We do not track usage
- We do not share your prompts with third parties

### API Key Security

- API key stored locally
- Never sent to our servers
- Only used to communicate with Runware

---

## 📝 Keyboard Shortcuts

Coming soon!

---

## 🎓 Learn More

- [Runware AI](https://runware.ai/) - AI platform
- [Prompt Engineering Guide](https://example.com) - Learn prompts
- [Community Gallery](https://example.com) - See examples

---

## 📋 FAQ

**Q: Is this free?**
A: You need a Runware API key, which has pricing tiers. Some free credits may be available.

**Q: What image formats are supported?**
A: JPG, PNG, WEBP

**Q: Can I use generated images commercially?**
A: Yes, check Runware's terms of service for details.

**Q: Can I generate videos?**
A: Video generation coming in a future update.

**Q: What's the maximum resolution?**
A: Up to 2048x2048 depending on your plan.

**Q: Can I use my own images?**
A: Image-to-image feature coming soon.

---

**Version**: 1.0
**Last Updated**: 2026-01-02
**Made with ❤️ by the Runware Generator Team**
```
