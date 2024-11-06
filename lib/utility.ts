export function truncateString(inputString: string, maxLength: number): string {
    if (inputString.length <= maxLength) {
        // No need to truncate, the string is already within the specified length
        return inputString;
    } else {
        // Truncate the string
        return inputString.substring(0, maxLength);
    }
  }