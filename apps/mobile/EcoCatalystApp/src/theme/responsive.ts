import { Dimensions, Platform, PixelRatio } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const baseWidth = 375;
const baseHeight = 812;

/**
 * Scales width dimension based on device screen width
 * @param size - Size to scale
 * @returns Scaled size
 */
export const horizontalScale = (size: number): number => {
  return (SCREEN_WIDTH / baseWidth) * size;
};

/**
 * Scales height dimension based on device screen height
 * @param size - Size to scale
 * @returns Scaled size
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / baseHeight) * size;
};

/**
 * Scales size with a factor for more moderate scaling
 * @param size - Size to scale
 * @param factor - Factor to moderate scaling (default: 0.5)
 * @returns Moderately scaled size
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + ((horizontalScale(size) - size) * factor);
};

export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

/**
 * Scales font size with platform-specific adjustments
 * @param size - Font size to scale
 * @returns Scaled font size
 */
export const fontScale = (size: number): number => {
  const newSize = horizontalScale(size);
  if (Platform.OS === 'android') {
    return Math.min(newSize, size * 1.2);
  }
  return newSize;
};

/**
 * Returns responsive padding based on device size
 * @param size - Base padding size
 * @returns Responsive padding
 */
export const responsivePadding = (size: number): number => {
  if (isSmallDevice) return size * 0.8;
  if (isLargeDevice) return size * 1.2;
  return size;
};

/**
 * Returns responsive margin based on device size
 * @param size - Base margin size
 * @returns Responsive margin
 */
export const responsiveMargin = (size: number): number => {
  if (isSmallDevice) return size * 0.8;
  if (isLargeDevice) return size * 1.2;
  return size;
};
