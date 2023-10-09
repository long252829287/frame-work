const utilsTime = {
    formatTime: function(time) {
      const seconds = parseInt(time) || 0;
      const minutes = Math.floor(seconds / 60);
      
      const formattedSeconds = seconds % 60;
      const formattedMinutes = minutes % 60;
      
      const result = [
        formattedMinutes.toString().padStart(2, '0'),
        formattedSeconds.toString().padStart(2, '0')
      ].join(':');
      
      return result || '00:00';
    }
};
export { utilsTime };
