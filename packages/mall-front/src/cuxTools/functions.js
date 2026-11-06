const functions = {};

export function coverCuxSet(data) {
  Object.keys(data).forEach(key => {
    functions[key] = data[key];
  });
}

export default functions;
