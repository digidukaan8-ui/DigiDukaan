import ReCAPTCHA from "react-google-recaptcha";
import useThemeStore from "../../store/theme";
import { motion, AnimatePresence } from "framer-motion";

export default function Recaptcha({ onVerify }) {
  const { isDark } = useThemeStore();

  const handleChange = (token) => {
    if (onVerify) {
      onVerify(token);
    }
  };

  return (
    <div className="my-2 flex justify-center items-center min-h-[78px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY}
            theme={isDark ? "dark" : "light"}
            onChange={handleChange}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
