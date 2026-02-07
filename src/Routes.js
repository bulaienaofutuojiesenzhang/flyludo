import { View, Image, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';



import ArtistList from "./view/homes/ArtistList";
import ArtistDetail from "./view/homes/ArtistDetail";

import DynamicDetail from "./view/dynamic/DynamicDetail"; //动态详情
import XuqiuDetail from "./view/dynamic/XuqiuDetail"; //需求详情

import PublishDetail from "./view/publish/PublishDetail"; //发布第二部
import WorkList from "./view/publish/WorkList";
import WorkDetail from "./view/publish/WorkDetail";
import WorkEvidence from "./view/publish/WorkEvidence";
import WorkBanquan from "./view/publish/WorkBanquan";

// 我的

import UserChange from "./view/user/UserChange";
import VerificationCenter from "./view/user/VerificationCenter";
import ApproveUser from "./view/user/ApproveUser";
import ApproveArtist from "./view/user/ApproveArtist";
import ApproveCompany from "./view/user/ApproveCompany";
import MyHome from "./view/user/MyHome";
import YikaDci from "./view/user/YikaDci";
import MyCopyright from "./view/user/MyCopyright";
import MyCrDetail from "./view/user/MyCrDetail";
import MyBqDetail from "./view/user/MyBqDetail";
import MyBqDdetail from "./view/user/MyBqDdetail";
import MyFans from "./view/user/MyFans";
import MyFocus from "./view/user/MyFocus";
import InviteFriends from "./view/user/InviteFriends";
import GuanyuYika from "./view/user/GuanyuYika";
import Setting from "./view/user/Setting";
import Yonghuxieyi from "./view/user/Yonghuxieyi";
import Yinsixieyi from "./view/user/Yinsixieyi";
import CausMens from "./view/user/CausMens";
import ProblemBack from "./view/user/ProblemBack";
import Zhuxiao from "./view/user/Zhuxiao";
import CopyrightRegister from './view/publish/CopyrightRegister';
import CopyrightEvidence from './view/publish/CopyrightEvidence';
import MyOrderOv from './view/user/MyOrderOv';
import MyOrderList from './view/user/MyOrderList';
import ChangjianWt from './view/user/ChangjianWt';

import PrivacyInfo from './view/document/PrivacyInfo';
import ThirdPartySDK from './view/document/ThirdPartySDK';

import CoupleFlyingChess from './view/games/CoupleFlyingChess';
import TruthMode from './view/games/TruthMode';
import DareMode from './view/games/DareMode';
import TruthOrDareList from './view/games/TruthOrDareList';
import TruthOrDareGame from './view/games/TruthOrDareGame';
import CreateQuestion from './view/games/CreateQuestion';

// 小工具
import RandomNumber from './view/tools/RandomNumber';
import DiceGame from './view/tools/DiceGame';
import CoinFlip from './view/tools/CoinFlip';
import LuckyDraw from './view/tools/LuckyDraw';
import WoodenFish from './view/tools/WoodenFish';
import DailyFortune from './view/tools/DailyFortune';
import LuckyWheel from './view/tools/LuckyWheel';
import QRCodeGenerator from './view/tools/QRCodeGenerator';
import DeviceInfo from './view/tools/DeviceInfo';


export default [
  
  {
    name: 'DynamicDetail',
    screen: DynamicDetail,
    options: {
      title: "详情",
      gestureEnabled: false,
      headerBackTitle: '',
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },
  {
    name: 'XuqiuDetail',
    screen: XuqiuDetail,
    options: {
      title: "详情",
      gestureEnabled: false,
      headerBackTitle: '',
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'PublishDetail',
    screen: PublishDetail,
    options: {
      title: "作品信息",
      gestureEnabled: false,
      headerBackTitle: '',
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'WorkList',
    screen: WorkList,
    options: ({ navigation }) => ({
      title: "我的作品库",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.replace('MainTab', { screen: 'Publish' })} // 跳转到 Tab 页面
          style={{ marginRight: 15 }}
        >
          <Image style={{ width: 23, height: 23 }} source={require('./asserts/images/tabbar/icon_work_cre.png')} resizeMode='contain' />
        </TouchableOpacity>
      ),
    })
  },

  {
    name: 'WorkDetail',
    screen: WorkDetail,
    options: ({ navigation }) => ({
      title: "作品详情",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    })
  },

  {
    name: 'WorkEvidence',
    screen: WorkEvidence,
    options: ({ navigation }) => ({
      title: "著作权信息",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    })
  },

  {
    name: 'WorkBanquan',
    screen: WorkBanquan,
    options: ({ navigation }) => ({
      title: "版权登记",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    })
  },

  {
    name: 'ArtistList',
    screen: ArtistList,
    options: {
      title: "用户管理",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'ArtistDetail',
    screen: ArtistDetail,
    options: {
      title: "",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
        backgroundColor: '#3A3A3C',
      },
      headerTitleAlign: 'center',
      headerTintColor: 'white',
    }
  },
  {
    name: 'MyHome',
    screen: MyHome,
    options: {
      title: "",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
        backgroundColor: '#3A3A3C',
      },
      headerTitleAlign: 'center',
      headerTintColor: 'white',
    }
  },

  {
    name: 'VerificationCenter',
    screen: VerificationCenter,
    options: {
      title: "认证中心",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  }, 

  {
    name: 'UserChange',
    screen: UserChange,
    options: {
      title: "修改信息",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  }, 

  {
    name: 'MyCopyright',
    screen: MyCopyright,
    options: {
      title: "我的版权",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'MyCrDetail',
    screen: MyCrDetail,
    options: {
      title: "我的存证",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  
  {
    name: 'MyBqDdetail',
    screen: MyBqDdetail,
    options: {
      title: "版权详情",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'MyBqDetail',
    screen: MyBqDetail,
    options: ({ navigation }) => ({
      title: "版权登记",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('YikaDci')} // 跳转到 Tab 页面
          style={{ marginRight: 15 }}
        >
          <Text style={{ color: '#333' }}>同城有约DCI</Text>
        </TouchableOpacity>
      ),
    })

  },


  {
    name: 'YikaDci',
    screen: YikaDci,
    options: {
      title: "同城有约DIC",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },


  {
    name: 'MyFans',
    screen: MyFans,
    options: {
      title: "我的粉丝",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'MyFocus',
    screen: MyFocus,
    options: {
      title: "我的关注",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },


  {
    name: 'InviteFriends',
    screen: InviteFriends,
    options: {
      title: "邀请好友",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'ApproveUser',
    screen: ApproveUser,
    options: {
      title: "实名认证",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'ApproveArtist',
    screen: ApproveArtist,
    options: {
      title: "艺术家认证",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'ApproveCompany',
    screen: ApproveCompany,
    options: {
      title: "企业认证",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'GuanyuYika',
    screen: GuanyuYika,
    options: {
      title: "关于同城有约",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'Setting',
    screen: Setting,
    options: {
      title: "设置",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'Yonghuxieyi',
    screen: Yonghuxieyi,
    options: {
      title: "用户协议",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'Yinsixieyi',
    screen: Yinsixieyi,
    options: {
      title: "隐私协议",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'ProblemBack',
    screen: ProblemBack,
    options: {
      title: "问题反馈",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'PrivacyInfo',
    screen: PrivacyInfo,
    options: {
      title: "个人信息收集清单",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'ThirdPartySDK',
    screen: ThirdPartySDK,
    options: {
      title: "第三方SDK使用说明",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'CausMens',
    screen: CausMens,
    options: {
      title: "联系客服",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'Zhuxiao',
    screen: Zhuxiao,
    options: {
      title: "用户注销",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0, // Android 去掉头部阴影
        shadowOpacity: 0, // iOS 去掉头部阴影
        borderBottomWidth: 0, // iOS 去掉头部底部线
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'CopyrightRegister',
    screen: CopyrightRegister,
    options: {
      title: "版权登记",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'CopyrightEvidence',
    screen: CopyrightEvidence,
    options: {
      title: "版权存证",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'MyOrderOv',
    screen: MyOrderOv,
    options: {
      title: "我的订单",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'MyOrderList',
    screen: MyOrderList,
    options: {
      title: "登记订单",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    }
  },
  

  {
    name: 'ChangjianWt',
    screen: ChangjianWt,
    options: {
      title: "常见问题",
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'CoupleFlyingChess',
    screen: CoupleFlyingChess,
    options: {
      title: "情侣飞行棋",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'TruthMode',
    screen: TruthMode,
    options: {
      title: "真心话",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'DareMode',
    screen: DareMode,
    options: {
      title: "大冒险",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center',
    }
  },

  {
    name: 'TruthOrDareList',
    screen: TruthOrDareList,
    options: {
      title: "题库管理",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },
  
  {
    name: 'TruthOrDareGame',
    screen: TruthOrDareGame,
    options: {
      title: "游戏中",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

  {
    name: 'CreateQuestion',
    screen: CreateQuestion,
    options: {
      title: "创建题目",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

  // 小工具路由
  {
    name: 'RandomNumber',
    screen: RandomNumber,
    options: {
      title: "随机数生成器",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

  {
    name: 'DiceGame',
    screen: DiceGame,
    options: {
      title: "掷骰子",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

  {
    name: 'CoinFlip',
    screen: CoinFlip,
    options: {
      title: "抛硬币",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

  {
    name: 'LuckyDraw',
    screen: LuckyDraw,
    options: {
      title: "幸运抽签",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

  {
    name: 'WoodenFish',
    screen: WoodenFish,
    options: {
      title: "敲木鱼",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

  {
    name: 'DailyFortune',
    screen: DailyFortune,
    options: {
      title: "今日运势",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

  {
    name: 'LuckyWheel',
    screen: LuckyWheel,
    options: {
      title: "幸运转盘",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

  {
    name: 'QRCodeGenerator',
    screen: QRCodeGenerator,
    options: {
      title: "二维码生成",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

  {
    name: 'DeviceInfo',
    screen: DeviceInfo,
    options: {
      title: "设备信息",
      headerShown: false,
      headerBackTitle: '',
      gestureEnabled: false,
      presentation: 'modal',
      animation: 'slide_from_right',
    }
  },

]
