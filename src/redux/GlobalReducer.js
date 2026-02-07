const initialState = {
    isFirstApp: true,
};

const GlobalReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_GLOBALINFO':
            return {
                ...state,
                ...action.payload,
            }
        default:
            return state;
    }
}

export default GlobalReducer;