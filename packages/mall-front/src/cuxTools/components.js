import defaultComponents from './defaultComponents';

const components = {
  ...defaultComponents,
};

export function coverCuxSet(data) {
  Object.keys(data).forEach(key => {
    components[key] = data[key];
  });
}

export default components;
