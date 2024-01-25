export function truncateString(inputString: string, maxLength: number): string {
    if (inputString.length <= maxLength) {
        // No need to truncate, the string is already within the specified length
        return inputString;
    } else {
        // Truncate the string and append ellipsis (...) to indicate truncation
        return inputString.substring(0, maxLength) + '...';
    }
  }