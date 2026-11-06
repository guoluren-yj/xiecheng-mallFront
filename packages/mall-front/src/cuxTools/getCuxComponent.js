import components from './components';

export default function getCuxComponent(name) {
  const { [name]: Com } = components;
  return Com;
}
