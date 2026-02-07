const initialState = {
    isLogged: false, // 是否登陆
    token: null,
    name: '',
    account: '',
    userInfo: {},
  };
  
  const UserReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'LOGINSUCCESS':
        return {
            ...state,
            ...action.payload.userInfo,
            token: action.payload.token,
            isLogged: true
        };
      case 'SET_USERINFO':
        return {
          ...state,
          ...action.payload,
        };
      case 'LOGOUT':
        return initialState;
      default:
        return state;
    }
  };
  
  export default UserReducer;