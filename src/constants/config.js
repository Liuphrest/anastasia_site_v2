export const CONFIG = {
  STARS_COUNT: 156,
  QR_CODE_PATH: '/images/QR.png',
  EXPERIENCE_START_YEAR: 2019,
  ANIMATION_DURATION: 0.6,
  TRANSITIONS: {
    EASE_OUT: 'easeOut',
    EASE_IN_OUT: 'easeInOut',
    SPRING: { type: 'spring', stiffness: 300, damping: 30 }
  },
  VIEWPORT_THRESHOLDS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1440
  },
  PERFORMANCE: {
    STARS_MOBILE: 50,
    STARS_TABLET: 100,
    STARS_DESKTOP: 156,
    ANIMATION_INTERVAL: 16.67, // 60fps
    REDUCED_MOTION_THRESHOLD: 0.5
  }
};

export const PATHS = {
  QR_CODE: CONFIG.QR_CODE_PATH,
  IMAGES: {
    PROFILE: '/images/Profile.jpg',
    FRAME: '/images/frame.png',
    ACADEMIC: '/images/Academic/',
    DIPLOMA: '/images/Diploma/',
    PLATFORM: '/images/Platform/',
    REVIEW: '/images/Review/',
    AVATARS: '/images/avatars/'
  }
};

export const LAYOUT = {
  HEADER_HEIGHT: 80,
  FOOTER_HEIGHT: 120,
  SECTION_SPACING: 100,
  CANVAS_EXTRA_BOTTOM: 120
};

export default CONFIG;