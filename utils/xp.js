import ConfettiCannon from 'react-native-confetti-cannon';

const [showConfetti, setShowConfetti] = useState(false);

if (currentXP > 0 && currentXP % 100 === 0) {
  setShowConfetti(true);
  setTimeout(() => setShowConfetti(false), 4000);
}

{showConfetti && <ConfettiCannon count={80} origin={{x: -10, y: 0}} />}