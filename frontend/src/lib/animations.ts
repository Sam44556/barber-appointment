export const EASE = [0.22, 1, 0.36, 1] as const;

export const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

export const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const FADE_IN = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

export const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const STAGGER_SLOW = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
};

export const SCALE_IN = {
  hidden: { scale: 0.96, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.4, ease: EASE } },
};
