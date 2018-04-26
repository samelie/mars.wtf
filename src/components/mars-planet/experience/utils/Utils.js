const HALF_PI = 1.5707963267948966
const U = {
  easeExpoIn: (val) => {
    return val == 0.0 ? val : Math.pow(2.0, 10.0 * (val - 1.0));
  },
  easeSinIn: (val) => {
    return (Math.sin(val - 1.0) * HALF_PI) + 1.0;
  },
  easeCubicIn: (t) => {
    return t * t * t;
  },
  clamp: (num, min, max) => {
    return num < min ? min : num > max ? max : num;
  },
}
export default U
