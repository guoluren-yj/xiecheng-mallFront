import { useLayoutEffect } from 'react';
import { withRouter } from 'react-router-dom';

function Refresh(props) {
  useLayoutEffect(() => {
    props.history.goBack();
  }, []);

  return null;
}
export default withRouter(Refresh);
