// import React, { useEffect, useState } from 'react';
// import ConfettiCannon from 'react-native-confetti-cannon';

// const XPConfetti = ({ currentXP, onComplete }) => {
//  const [showConfetti, setShowConfetti] = useState(false);

 // useEffect(() => {
   // if (currentXP > 0 && currentXP % 100 === 0) {
     // setShowConfetti(true);
     // const timer = setTimeout(() => {
       // setShowConfetti(false);
      //  if (typeof onComplete === 'function') {
        //  onComplete();
       // }
     // }, 4000);
     // return () => clearTimeout(timer);
   // }
 // }, [currentXP, onComplete]);

 // return showConfetti ? <ConfettiCannon count={80} origin={{ x: -10, y: 0 }} /> : null;
// };

// export default XPConfetti;