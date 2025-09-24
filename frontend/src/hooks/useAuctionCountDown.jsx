import { useState, useEffect, useMemo } from 'react';

const useAuctionCountdown = (endDate) => {
  const [timeLeft, setTimeLeft] = useState(null);

  // Convert to timestamp if it's a Date object, or parse if it's a string
  const endTimestamp = useMemo(() => {
    if (typeof endDate === 'string') {
      return new Date(endDate).getTime();
    }
    return endDate.getTime();
  }, [endDate]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = endTimestamp - now;
      
      if (difference <= 0) {
        return { completed: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
        minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
        seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
        completed: false
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTimestamp]); // Use timestamp which is a stable number

  return timeLeft;
};

export default useAuctionCountdown;