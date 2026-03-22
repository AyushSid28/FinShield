import { motion } from 'framer-motion';

const ORBS = [
  {
    className: 'left-[4%] top-[20%] h-28 w-28 md:h-40 md:w-40',
    style: { background: 'radial-gradient(circle, rgba(255,255,255,0.82) 0%, rgba(156,190,255,0.18) 36%, transparent 72%)' },
    duration: 11,
  },
  {
    className: 'right-[10%] top-[24%] h-28 w-28 md:h-36 md:w-36',
    style: { background: 'radial-gradient(circle, rgba(255,255,255,0.84) 0%, rgba(245,123,255,0.14) 34%, transparent 74%)' },
    duration: 14,
  },
  {
    className: 'bottom-[28%] left-[58%] h-24 w-24 md:h-32 md:w-32',
    style: { background: 'radial-gradient(circle, rgba(255,255,255,0.68) 0%, rgba(103,153,255,0.15) 40%, transparent 74%)' },
    duration: 13,
  },
];

export default function BackgroundEffects() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-page" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,127,255,0.08),transparent_36%)]" />
      <div className="grid-backdrop" />
      <div className="noise-overlay" />

      <motion.video
        autoPlay
        muted
        loop
        playsInline
        className="absolute left-1/2 top-[35%] w-[68vw] max-w-[760px] -translate-x-1/2 -translate-y-1/2 opacity-[0.08] blur-[1.8px] md:w-[48vw]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <source src="/raaw.mp4" type="video/mp4" />
      </motion.video>

      {ORBS.map((orb) => (
        <motion.div
          key={orb.className}
          className={`absolute rounded-full blur-[10px] ${orb.className}`}
          style={orb.style}
          animate={{
            y: [0, -18, 0],
            x: [0, 10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
