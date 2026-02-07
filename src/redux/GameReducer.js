// 预制真心话题库
const DEFAULT_TRUTHS = [
  '说过的最感人的情话？',
  '初恋是什么时候？',
  '最想和谁一起去旅行？',
  '做过最疯狂的事情？',
  '最喜欢异性身上的什么特质？',
  '暗恋过谁？',
  '收到过最特别的礼物是什么？',
  '最想实现的愿望？',
  '最难忘的一次约会？',
  '如果能回到过去，最想改变什么？',
  '觉得自己最大的优点是什么？',
  '最害怕失去什么？',
  '对初吻的印象？',
  '喜欢什么类型的异性？',
  '做过最后悔的事情？',
  '最想对某个人说的话？',
  '最尴尬的一次经历？',
  '最感动的一件事？',
  '如果明天是世界末日，最想做什么？',
  '有没有暗恋现场的人？',
  '最想去的地方？',
  '理想中的另一半是什么样的？',
  '做过最浪漫的事？',
  '最想拥有的超能力？',
  '人生中最重要的三样东西？',
  '最喜欢自己的哪个部位？',
  '最想感谢的人是谁？',
  '有什么不为人知的秘密？',
  '最崇拜的人是谁？',
  '如果有来生，想成为什么？'
];

// 预制大冒险题库
const DEFAULT_DARES = [
  '对在场的某人说"我喜欢你"',
  '做20个俯卧撑',
  '唱一首歌',
  '跳一段舞',
  '学动物叫三声',
  '做10个深蹲',
  '讲一个笑话',
  '模仿在场的某个人',
  '用方言表白',
  '做一个鬼脸保持30秒',
  '打电话给通讯录第5个人说"我想你了"',
  '原地转10圈',
  '做一个才艺表演',
  '用屁股写自己的名字',
  '抱住旁边的人保持1分钟',
  '吃一口别人喂的食物',
  '做5个单腿跳',
  '说5句绕口令',
  '摆一个最帅/最美的姿势拍照',
  '给某人按摩肩膀2分钟',
  '蒙眼原地走5步',
  '做一套广播体操',
  '用脸接住别人抛的纸团',
  '倒着说一段话',
  '学猫叫10声',
  '做平板支撑30秒',
  '闭眼摸鼻子3次',
  '单脚站立1分钟',
  '表演一段模仿秀',
  '喝一杯水一口气喝完'
];

const initialState = {
  truths: DEFAULT_TRUTHS,
  dares: DEFAULT_DARES,
};

const GameReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_TRUTHS':
      return {
        ...state,
        truths: action.payload,
      };
    case 'UPDATE_DARES':
      return {
        ...state,
        dares: action.payload,
      };
    case 'UPDATE_GAME_DATA':
      return {
        ...state,
        truths: action.payload.truths || state.truths,
        dares: action.payload.dares || state.dares,
      };
    case 'RESET_GAME_DATA':
      return {
        truths: DEFAULT_TRUTHS,
        dares: DEFAULT_DARES,
      };
    default:
      return state;
  }
};

export default GameReducer;

