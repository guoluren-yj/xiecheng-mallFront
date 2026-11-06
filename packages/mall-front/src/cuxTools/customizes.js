const customizes = {};

export function coverCuxSet(data) {
  Object.keys(data).forEach((key) => {
    customizes[key] = data[key];
  });
}

export default customizes;
