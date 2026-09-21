# Bhirithi Companion — Android compliance foundation

The supplied specification requires a native Android implementation using Jetpack Compose, Material 3, Window Size Classes, and UI → ViewModel → Repository → data source architecture.

## Platform decisions
- Application: Bhirithi Companion
- Package: com.bhirithi.companion
- Minimum Android: 26
- Target Android: 35
- UI: Jetpack Compose + Material 3
- Responsive layout: Material 3 adaptive / Window Size Classes
- Architecture: UI → ViewModel → Repository → data source
- Local persistence direction: Room
- Version: 0.1.0

This module is a compliance foundation, not a claim that the complete application passes the supplied test matrix. Native feature parity and device testing remain required.

The existing React/Vite app remains the current web implementation. The Android module is the path for satisfying the Android-specific requirements.

## Next implementation order
1. Port Panda chat and Pipecat voice.
2. Port Study, Media, Yoga, Routine, Parent and Rescue features.
3. Add Room entities/DAOs for offline state and synchronization.
4. Add repository-backed Gemini/Pipecat networking with explicit error states.
5. Add runtime permissions only at camera/microphone feature entry.
6. Add accessibility semantics and scalable typography.
7. Verify compact, medium and expanded window sizes in portrait and landscape.
8. Run the complete validation sequence in the supplied specification.
