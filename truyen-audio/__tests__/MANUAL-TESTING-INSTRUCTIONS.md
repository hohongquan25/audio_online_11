# Manual Testing Instructions - Task 1

## Quick Start Guide

You've chosen to perform the manual testing yourself. Here's how to proceed:

### Step 1: Access the App on iPhone 11

**Option A: Local Development**
1. Start your development server: `npm run dev` (in `truyen-audio/` directory)
2. Find your local IP address:
   - Windows: `ipconfig` → look for IPv4 Address
   - Mac/Linux: `ifconfig` → look for inet address
3. On iPhone 11, connect to the same WiFi network
4. Open Safari and navigate to: `http://[YOUR_IP]:3000`

**Option B: Deployed App**
1. If you have a deployed version, use that URL
2. Open Safari on iPhone 11
3. Navigate to your deployed app URL

### Step 2: Follow the Testing Checklist

Open the file: `truyen-audio/__tests__/mobile-interaction-bug-exploration.md`

Work through each test case:
1. ✅ Test 1: Viewport Meta Tag Configuration
2. ✅ Test 2: Hamburger Menu Touch Interaction
3. ✅ Test 3: Audio Player Visibility and Controls
4. ✅ Test 4: Register Form Submission
5. ✅ Test 5: Login Form Submission

### Step 3: Document Your Findings

For each test that FAILS (expected outcome):
- Check the FAIL checkbox
- Fill in the "Counterexamples Found" section with detailed observations
- Take screenshots if possible (helpful for debugging)

### Step 4: Complete Root Cause Analysis

Based on your observations, check which hypotheses are confirmed:
- Missing Viewport Meta Tag
- Touch Event Handling Issues
- CSS Layout/Positioning Issues
- iOS Safari Specific Quirks

### Step 5: Report Back

Once testing is complete:
1. Save your documented results in the markdown file
2. Let me know the results (how many tests failed, key findings)
3. I'll proceed with the next steps based on your findings

## Expected Outcome

**IMPORTANT**: Since this is testing on UNFIXED code, we EXPECT most or all tests to FAIL. This is the CORRECT outcome - it confirms the bug exists.

- ✅ **Good Result**: Tests FAIL → Bug confirmed, proceed with fix
- ⚠️ **Unexpected Result**: Tests PASS → Bug not reproduced, need to re-investigate

## Troubleshooting

**Can't access app from iPhone 11?**
- Ensure both devices are on the same WiFi network
- Check firewall settings on your development machine
- Try using `0.0.0.0` instead of `localhost` when starting dev server

**Safari DevTools needed?**
- Connect iPhone to Mac via USB
- Enable Web Inspector on iPhone: Settings → Safari → Advanced → Web Inspector
- Open Safari on Mac → Develop → [Your iPhone] → [Your Page]

**Need test data?**
- For login test, you may need to create a test account first
- Use the register form or create via database directly

## Questions?

If you encounter any issues or have questions during testing, document them in the Notes section of the testing checklist and let me know.

---

**Ready to start?** Open `mobile-interaction-bug-exploration.md` and begin testing! 🧪📱
