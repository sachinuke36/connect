export const getTime = (isoString: Date) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
  
    const seconds = Math.floor(diffInMs / 1000);
    const minutesAgo = Math.floor(seconds / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);
  
    let timeAgo: string;
  
    if (daysAgo > 0) {
      timeAgo = `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
    } else if (hoursAgo > 0) {
      timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
    } else if (minutesAgo > 0) {
      timeAgo = `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
    } else {
      timeAgo = `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    }
  
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const secondsFormatted = date.getSeconds().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}:${secondsFormatted}`;
  
    return { timeAgo, formattedTime };
  };
  
//   // Example usage:
//   const result = getTime(new Date("2025-01-10T16:59:23.219Z"));
//   console.log(result.timeAgo); // Output: e.g., "2 hours ago"
//   console.log(result.formattedTime); // Output: e.g., "16:59:23"
  