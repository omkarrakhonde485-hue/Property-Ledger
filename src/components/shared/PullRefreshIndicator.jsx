import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function PullRefreshIndicator({ refreshing }) {
  return (
    <AnimatePresence>
      {refreshing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex justify-center overflow-hidden"
        >
          <Loader2 className="w-5 h-5 animate-spin text-primary my-1" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}