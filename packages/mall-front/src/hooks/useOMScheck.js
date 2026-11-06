import { isUseOms } from 'services/cartService';

function useOMScheck(props) {
  const {
    location: { pathname },
    history,
  } = props;
  if (pathname?.includes('/oms')) {
    isUseOms().then(res => {
      if (!res) history.push('/my-mall/my-order');
    });
  }
}

export default useOMScheck;
