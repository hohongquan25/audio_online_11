# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Mobile Touch Interactions on iPhone 11
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Manual Testing Approach**: Since this is a device-specific bug, use manual testing on iPhone 11 iOS Safari
  - Test implementation details from Bug Condition in design:
    - Load app on iPhone 11, verify viewport meta tag missing (isBugCondition: viewport.configured == false)
    - Tap hamburger menu button, verify no response (isBugCondition: target == "hamburger-menu-button" AND NOT menuToggled)
    - Navigate to listen page, verify audio player not visible (isBugCondition: page == "listen-page" AND NOT audioPlayerVisible)
    - Fill register form, tap submit, verify no submission (isBugCondition: target == "register-submit-button" AND NOT formSubmitted)
    - Fill login form, tap submit, verify no submission (isBugCondition: target == "login-submit-button" AND NOT formSubmitted)
  - The test assertions should match the Expected Behavior Properties from design
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - Viewport meta tag absent in HTML head
    - Touch events not triggering onClick handlers
    - Audio player cut off or hidden on mobile viewport
    - Form submissions not working on touch events
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Desktop and Other Interactions Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (desktop browsers, non-iPhone devices)
  - Write tests capturing observed behavior patterns from Preservation Requirements:
    - Desktop browser interactions work correctly (mouse clicks, keyboard navigation)
    - Navigation links in menu route correctly
    - Audio player on desktop works with all controls (play/pause, skip, volume, speed, sleep timer)
    - Form validation errors display correctly
    - All other features work normally (favorites, comments, VIP plans, etc.)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for mobile interaction issues on iPhone 11

  - [x] 3.1 Add viewport meta tag to root layout
    - Open `truyen-audio/app/layout.tsx`
    - Add viewport configuration to metadata export:
      ```typescript
      viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
      }
      ```
    - _Bug_Condition: input.viewport.configured == false_
    - _Expected_Behavior: viewport meta tag present with width=device-width, initial-scale=1_
    - _Preservation: Desktop rendering unchanged_
    - _Requirements: 1.5, 2.5, 3.1_

  - [x] 3.2 Fix hamburger menu touch handling
    - Open `truyen-audio/components/layout/Header.tsx`
    - Verify button has onClick handler (already present)
    - Add touch-friendly CSS styles to button:
      ```css
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
      touch-action: manipulation;
      cursor: pointer;
      ```
    - Ensure button has adequate touch target size (minimum 44x44px)
    - Verify z-index positioning (header already has z-50)
    - _Bug_Condition: input.target == "hamburger-menu-button" AND NOT menuToggled_
    - _Expected_Behavior: menu toggles open/closed on tap_
    - _Preservation: Desktop menu click behavior unchanged_
    - _Requirements: 1.1, 2.1, 3.2_

  - [x] 3.3 Fix audio player visibility and touch controls
    - Open `truyen-audio/components/audio/AudioPlayer.tsx`
    - Add mobile-specific styles to ensure player visible on mobile viewport:
      ```css
      @media (max-width: 768px) {
        /* Adjust player height, positioning for mobile */
      }
      ```
    - Verify all control buttons have onClick handlers (already present)
    - Add touch-friendly styles to all interactive elements
    - Test player visibility on iPhone 11 viewport size
    - _Bug_Condition: input.page == "listen-page" AND NOT audioPlayerVisible_
    - _Expected_Behavior: audio player displays with all controls visible and functional_
    - _Preservation: Desktop audio player behavior unchanged_
    - _Requirements: 1.2, 2.2, 3.3_

  - [x] 3.4 Fix register form submission on mobile
    - Open `truyen-audio/components/auth/RegisterForm.tsx`
    - Verify form has onSubmit handler with e.preventDefault() (already present)
    - Verify submit button has type="submit" and disabled state (already present)
    - Add touch-friendly styles to submit button
    - Increase button padding for better touch target on mobile
    - Test form submission on iPhone 11
    - _Bug_Condition: input.target == "register-submit-button" AND NOT formSubmitted_
    - _Expected_Behavior: form submits and redirects to login page_
    - _Preservation: Desktop form submission unchanged, validation errors still display_
    - _Requirements: 1.3, 2.3, 3.4_

  - [x] 3.5 Fix login form submission on mobile
    - Open `truyen-audio/components/auth/LoginForm.tsx`
    - Verify form has onSubmit handler with e.preventDefault() (already present)
    - Verify submit button has type="submit" and disabled state (already present)
    - Add touch-friendly styles to submit button
    - Increase button padding for better touch target on mobile
    - Test form submission on iPhone 11
    - _Bug_Condition: input.target == "login-submit-button" AND NOT formSubmitted_
    - _Expected_Behavior: form submits and user is authenticated_
    - _Preservation: Desktop form submission unchanged, validation errors still display_
    - _Requirements: 1.4, 2.4, 3.4_

  - [x] 3.6 Add global touch styles (optional)
    - Open or create `truyen-audio/app/globals.css`
    - Add global touch-friendly styles for all interactive elements:
      ```css
      button, a, [role="button"] {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        touch-action: manipulation;
      }
      ```
    - This ensures consistent touch behavior across all components
    - _Preservation: Desktop interactions unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1_

  - [x] 3.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Mobile Touch Interactions Work Correctly
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1 on iPhone 11:
      - Verify viewport meta tag present in HTML
      - Tap hamburger menu, verify menu toggles
      - Navigate to listen page, verify audio player visible and controls work
      - Fill and submit register form, verify submission works
      - Fill and submit login form, verify authentication works
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Desktop and Other Interactions Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation tests from step 2 on desktop browsers:
      - Verify desktop menu click works
      - Verify desktop audio player works with all controls
      - Verify desktop form submissions work
      - Verify navigation links work
      - Verify other features work (favorites, comments, VIP plans)
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run all exploration tests on iPhone 11 - should PASS
  - Run all preservation tests on desktop - should PASS
  - Test on multiple iOS devices if available (iPhone 12, 13, iPad)
  - Test with different screen orientations (portrait, landscape)
  - Ensure all tests pass, ask the user if questions arise
