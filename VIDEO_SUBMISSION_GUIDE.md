# Video Submission Guide

The demonstration video is a mandatory component of your submission. This guide helps you create a professional, effective video showcase of your FHEVM example system.

---

## 📹 Video Requirements

### Mandatory Specifications

- **Duration**: 5-15 minutes (12 minutes recommended)
- **Resolution**: 1080p (1920x1080) minimum
- **Frame Rate**: 30fps minimum (60fps ideal)
- **Audio**: Clear, properly leveled (no background noise)
- **Format**: MP4, WebM, or MOV
- **Platform**: YouTube, Vimeo, or similar (must be publicly accessible)
- **Accessibility**: Captions or subtitles strongly recommended

### Equipment Needed

- **Recording Software**: OBS Studio (free), ScreenFlow, Camtasia, etc.
- **Microphone**: Built-in or external (decent quality)
- **Screen**: Preferably 1920x1080 or higher
- **System**: Any OS (Windows, macOS, Linux)

---

## 📝 Video Script Template

### Introduction (1-2 minutes)

```
Title Card: "FHEVM Example Repository System"
Your name and brief introduction

"Hello, I'm [Name]. Today I'll demonstrate [Project Title],
a comprehensive system for building FHEVM examples.

This project provides:
- Automated repository generation
- Complete example contracts
- Comprehensive test suites
- Auto-generated documentation

Let's dive into how it works."
```

### Content Structure (10-12 minutes)

#### 1. Project Overview (1 minute)
```
Show: GitHub repository
Explain:
- Project purpose
- Key features
- What problems it solves
- Target audience
```

#### 2. Directory Structure (1 minute)
```
Show: File explorer or terminal
Display:
- base-template/ folder
- contracts/ organization
- test/ structure
- scripts/ for automation
- examples/ documentation
- docs/ developer guides

Explain:
- Why this structure
- How developers navigate it
- How automation tools use it
```

#### 3. Base Template Walkthrough (2 minutes)
```
Show: Opening base-template in IDE
Display:
- package.json with dependencies
- hardhat.config.ts configuration
- Example contract (FHECounter or similar)
- Example test file
- README with instructions

Highlight:
- How it's ready to use
- What can be customized
- FHEVM library imports
- Test setup
```

#### 4. Example Contract Deep Dive (2-3 minutes)
```
Show: Contract code in IDE
Walk through:
- Contract declaration and inheritance
- State variables explanation
- Function implementation
- Permission handling (FHE.allowThis + FHE.allow)
- Comments and documentation

Explain:
- Key concepts demonstrated
- Why this pattern matters
- Common mistakes to avoid
- How it relates to FHEVM principles
```

#### 5. Test Suite Demonstration (2 minutes)
```
Show: Test file in IDE
Point out:
- Test structure (Arrange-Act-Assert)
- ✅ Success cases
- ❌ Failure cases
- Edge case testing

Then: Run tests
Show:
- Test execution in terminal
- All tests passing
- Output clarity
- Any gas reports

Explain:
- Why all three test types matter
- How developers learn from failures
- What coverage means
```

#### 6. Automation Scripts (2-3 minutes)

**Part A: Single Example Generation**
```
Show: Terminal with script directory
Display: create-fhevm-example.ts code

Explain: How it works
- Takes example name as input
- Clones base template
- Injects contract and tests
- Updates configuration

Then: Run the script
Command: npm run create-example fhe-counter ./examples/my-fhe-counter

Show:
- Script output
- Progress messages
- Generated files

Navigate to generated directory
Show:
- It's a complete, standalone project
- All files are in place
- Ready to use immediately
```

**Part B: Category Generation**
```
Show: create-fhevm-category.ts code

Explain:
- Groups multiple related examples
- Useful for learning collections
- Includes all category examples
- Single unified project

Run the script:
npm run create-category basic ./examples/basic-collection

Show:
- Script output
- Multiple examples in one project
```

#### 7. Generated Repository Testing (2 minutes)
```
Navigate to generated example directory

Show commands:
npm install
npm run compile
npm run test

Display:
- Installation progress
- Compilation success
- Test execution
- All tests passing
- No errors

Point out:
- How easy it is for users
- No additional setup needed
- Everything just works
```

#### 8. Documentation Generation (1-2 minutes)
```
Show: generate-docs.ts script

Run: npm run generate-docs --all

Display:
- Script output
- Generated markdown files
- Documentation structure

Show: Generated SUMMARY.md
- Index of all examples
- Category organization
- Links structure

Open example: Generated markdown file
Show:
- Formatted code
- Clear structure
- Accessibility
- GitBook compatibility
```

#### 9. Generated Documentation Viewing (1 minute)
```
Show: Generated documentation files
Point out:
- Each example has its own file
- Code is properly formatted
- Structure is consistent
- Easy to navigate

Open in viewer/browser if possible
Show:
- How it looks to end users
- Professional appearance
- Clear organization
```

#### 10. Developer Guide & Tools (1 minute)
```
Show: Documentation files
- DEVELOPER_GUIDE.md
- PATTERNS.md
- BEST_PRACTICES.md
- TROUBLESHOOTING.md

Briefly explain:
- How developers add new examples
- How to update dependencies
- Common patterns explained
- Solutions to typical problems
```

#### 11. Your Unique Contributions (1-2 minutes)
```
Highlight what makes YOUR submission special:
- Creative examples beyond requirements
- Innovative tooling
- Exceptional documentation
- Unique features
- Advanced patterns
- Performance optimizations

Demonstrate:
- Your additional examples
- Your automation improvements
- Your documentation enhancements
- Your innovative approaches
```

### Closing (1 minute)

```
Summary of what you showed:
- Complete system for FHEVM examples
- Automation that saves time
- High-quality documentation
- Ready-to-use examples

Thank you slide with:
- Your name
- Contact information (if desired)
- GitHub repository link
- Any social media (optional)

Final message:
"Thank you for watching. This project aims to help developers
learn FHEVM and build privacy-preserving smart contracts.
Visit [GitHub link] to learn more."
```

---

## 🎬 Recording Tips & Best Practices

### Before Recording

1. **Prepare Your Environment**
   - Clean desktop background
   - Close unnecessary applications
   - Disable notifications
   - Close chat applications
   - Prepare terminal with good font size

2. **Test Your Setup**
   - Record 30-second test
   - Check audio levels
   - Verify screen resolution
   - Test microphone quality
   - Ensure no echo

3. **Practice Your Script**
   - Read through full script
   - Time your segments
   - Identify natural pauses
   - Mark difficult pronunciations

4. **Arrange Your workspace**
   ```
   Set up:
   - IDE/Editor with good theme (high contrast)
   - Terminal with large font (24pt minimum)
   - GitHub repository ready
   - Project running on localhost if needed
   - Documentation files open
   ```

### During Recording

1. **Recording Settings**
   ```
   OBS Studio Settings (example):
   - Resolution: 1920x1080
   - Frame rate: 60fps
   - Bitrate: 6000 kbps for video
   - Audio: 128 kbps
   ```

2. **Speaking Tips**
   - Speak clearly and at moderate pace
   - Pause between thoughts
   - Avoid filler words (um, uh, like)
   - Use emphasis for important points
   - Maintain enthusiasm

3. **Visual Presentation**
   - Move mouse deliberately
   - Use keyboard shortcuts visibly
   - Zoom in on code when needed
   - Use colors to highlight
   - Keep text readable

4. **Pacing**
   - Don't rush through important parts
   - Pause at natural breaks
   - Allow time for viewers to read
   - Match speaking to visual changes

### Common Recording Mistakes to Avoid

❌ **Don't:**
- Record in a noisy environment
- Use tiny text that viewers can't read
- Speak too fast or too slowly
- Show sensitive information
- Use profanity or inappropriate language
- Record with poor lighting
- Fumble through sections
- Scroll too fast
- Use confusing color schemes

✅ **Do:**
- Record in quiet environment
- Use large, readable fonts
- Speak clearly and deliberately
- Protect all sensitive data
- Use professional language
- Ensure good screen contrast
- Prepare and practice
- Scroll at readable pace
- Use high-contrast themes

---

## 🎨 Visual Design Tips

### Screen Setup

**IDE/Editor Theme:**
```
Recommended:
- Dark background (easier on eyes)
- High contrast text
- Syntax highlighting enabled
- Line numbers visible
- Font: Monaco, Inconsolata, or Courier New
- Size: 14-16pt minimum
```

**Terminal Theme:**
```
Recommended:
- Dark background
- Bright text (white or light green)
- Clear prompt formatting
- Large font (24pt minimum)
- Good contrast
```

**Color Usage:**
```
Effective colors for highlighting:
- Yellow for emphasis
- Green for success
- Red for errors/warnings
- Blue for links
- Gray for comments
```

### UI Elements

**Add visual indicators:**
- Cursor highlighting
- Zoom cursor when needed
- Use pointer/arrow tools
- Highlight important code
- Use text annotations

---

## 📱 Recording Software Recommendations

### Free Options

**OBS Studio** (Cross-platform)
- Pros: Free, powerful, active community
- Cons: Steeper learning curve
- Best for: Professional recordings

**ScreenFlow** (macOS only)
- Pros: Easy to use, great quality
- Cons: macOS only
- Best for: Quick recordings

**ShareX** (Windows)
- Pros: Free, simple, fast
- Cons: Windows only
- Best for: Quick demos

### Paid Options

**Camtasia** - Excellent all-in-one tool
**Snagit** - Great for screenshots and quick videos
**ScreenFlow** - Professional macOS recording

### Browser-based

**ScreenX** (various options) - No installation needed
- Warning: May have quality limitations

---

## 🔊 Audio Quality

### Microphone Setup

**Good microphone positioning:**
- 6-12 inches from mouth
- Slightly off to the side
- Stable (don't move it)
- Wind screen if needed

**Audio levels:**
- Peak around -6dB to -3dB
- No clipping
- Consistent volume
- Minimal background noise

### Audio Enhancement

**In-recording improvements:**
- Use noise suppression
- Apply compressor for consistency
- Add slight EQ boost
- Monitor levels in real-time

**Post-recording improvements:**
- Noise reduction software
- Volume normalization
- EQ adjustment
- Compressor for consistency

---

## 📤 Uploading & Sharing Your Video

### Platform Selection

**YouTube**
- Pros: Largest platform, great reach, unlimited length
- Cons: Monetization concerns, processing time
- Best for: Official submission

**Vimeo**
- Pros: Professional, high quality, good features
- Cons: Paid plans for advanced features
- Best for: Premium feel

**GitHub Releases**
- Pros: Same platform as code
- Cons: Less ideal for video
- Best for: Supplementary content

### Upload Process

1. **Prepare Video File**
   - Export in H.264 codec
   - 1920x1080 resolution
   - MP4 format
   - Final file size: 100-500MB

2. **Upload to Platform**
   - Create account if needed
   - Set to public/unlisted
   - Add descriptive title
   - Add detailed description with timestamps

3. **Video Description Template**
   ```
   FHEVM Example Repository System - Demonstration

   This video demonstrates [Project Title], a comprehensive system
   for creating FHEVM example repositories.

   Key Features:
   - Automated repository scaffolding (00:30)
   - Base template overview (02:15)
   - Example contract walkthrough (04:30)
   - Test suite demonstration (06:45)
   - Automation scripts showcase (08:30)
   - Documentation generation (11:00)
   - Generated repository testing (12:15)

   GitHub Repository: [link]
   Documentation: [link]
   ```

### Sharing & Verification

1. **Test the Link**
   - Open in incognito/private mode
   - Verify it plays correctly
   - Check audio and video sync
   - Confirm it's accessible

2. **Create Backup**
   - Keep original video file
   - Export at multiple resolutions
   - Have backup upload ready

3. **Document in Submission**
   - Create VIDEO_SUBMISSION.md file
   - Include video link
   - Add timestamp markers
   - Note any special features

---

## ✅ Pre-Submission Checklist

Before finalizing your submission:

- [ ] Video is between 5-15 minutes
- [ ] Resolution is 1080p or higher
- [ ] Frame rate is 30fps or higher
- [ ] Audio is clear with good levels
- [ ] No background noise
- [ ] Microphone is of decent quality
- [ ] Video covers all required topics
- [ ] Captions/subtitles included
- [ ] No sensitive information visible
- [ ] Video is uploaded and public
- [ ] Link is accessible and works
- [ ] Video plays without errors
- [ ] Quality is professional
- [ ] Lighting is adequate
- [ ] Content is well-paced
- [ ] Visual elements are clear
- [ ] Code is readable
- [ ] Text is not too small
- [ ] Transitions are smooth
- [ ] Background is appropriate

---

## 🎯 Example Timestamps

A well-structured video might look like:

```
0:00-1:00   - Introduction & Project Overview
1:00-2:00   - Directory Structure Tour
2:00-4:00   - Base Template Walkthrough
4:00-6:30   - Example Contract Deep Dive
6:30-8:30   - Test Suite Demonstration
8:30-11:00  - Automation Scripts Showcase
11:00-12:30 - Documentation Generation
12:30-13:30 - Testing Generated Repository
13:30-14:30 - Your Unique Contributions
14:30-15:00 - Closing & Summary
```

---

## 🚀 Final Tips

1. **Keep it Engaging**
   - Use varied camera angles
   - Include visual transitions
   - Highlight key moments
   - Show excitement for your work

2. **Be Professional**
   - Clean environment
   - Professional appearance
   - Clear speech
   - No distractions

3. **Demonstrate Confidence**
   - Know your material well
   - Practice beforehand
   - Speak clearly
   - Handle mistakes gracefully

4. **Show Your Personality**
   - Let your passion shine
   - Explain your motivation
   - Share your approach
   - Highlight innovations

5. **Make it Memorable**
   - Unique angle on problem
   - Creative solutions
   - Professional presentation
   - Clear value proposition

---

The demonstration video is your chance to showcase your work to the judges. Make it count! 🎬

Good luck with your recording! 🎉

