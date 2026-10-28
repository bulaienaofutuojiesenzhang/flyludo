const initialState = {
    isFirstApp: true,
    lingsheng: true, // 消息铃声 / 系统通知音
    zhendong: true, // 消息震动
    totalUnreadCount: 0,
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