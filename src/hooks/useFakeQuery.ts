import {useEffect, useState} from 'react';

interface State {
  loading: boolean;
  error: undefined | any;
  data: undefined | any;
}

const useFakeQuery = (_unused?: any) => {
  const [state, setState] = useState<State>({loading: true, error: undefined, data: undefined});
  useEffect(() => {
    setTimeout(() => setState({loading: false, error: undefined, data: {status: 'success'}}), 200);
  }, []);
  return state;
};

export default useFakeQuery;
