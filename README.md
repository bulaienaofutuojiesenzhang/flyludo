# flyludo

## 介绍
同城有约 - 飞行棋

应用一句话简介
同城社交新玩法，连接身边有趣灵魂，互动神器快乐随心定制。

应用详细介绍

同城有约是一款集娱乐工具和社交功能于一身的移动应用，为用户提供丰富的互动体验。
创意游戏互动 - 提供情侣飞行棋、真心话大冒险等游戏，支持自定义创建和分享，收获点赞收藏，与玩家互动。
社区内容分享 - 汇聚创意玩法内容，支持多种排序方式浏览，收藏实用游戏，参与互动话题。
实用工具集 - 包含幸运转盘、掷骰子、抛硬币、随机数生成、今日运势、敲木鱼、二维码生成器、颜色助手等多种实用工具，丰富日常生活。
同城社交连接 - 支持个性化游戏创作，分享创意作品，与其他用户交流互动。发现同城兴趣伙伴，了解身边朋友动态。

同城有约致力于为用户提供优质的娱乐工具和社交体验，让生活更有乐趣。

备案号：津ICP备2024015547号-6A

## 软件架构
React Naitive 0.76.1版本

### 系统版本
Node JS 20.18.0
Java Development Kit [JDK] 17
Android Studio - Android 14 (UpsideDownCake)

### UI库采用双UI系统 
[Native Base](https://docs.nativebase.io/getting-started)
[React Naitive Element](https://reactnativeelements.com/docs/components/chip)
选用组件可以点击连接查看

### 动画库
[react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#installation)
选用动画点击↑连接查看

### 其他组件
图标库 [react-native-vector-icons](https://oblador.github.io/react-native-vector-icons/)
开屏图 [react-native-splash-screen](https://www.npmjs.com/package/react-native-splash-screen)
引导图 [react-native-onboarding-swiper](https://www.npmjs.com/package/react-native-onboarding-swiper)



react-native-fast-image - 对图像缓存支持

#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)

#### 常用命令
./gradlew clean

安卓ANDROID
react-native run-android -- 运行ANDROID
./gradlew assembleRelease -- 打包命令
./gradlew stop -- 停止打包
./gradlew clean -- 清除包缓存
npx jetify -- 异常处理

./gradlew assembleRelease


#### 搭建过程
gradle-wrapper.properties 文件配置 
    distributionUrl=file\:///F:/yika/yikaRn/android/gradle/wrapper/***.zip
build.gradle 文件配置 
    maven {
        url 'https://maven.aliyun.com/repository/public'
    }
    maven {
        url 'https://mirrors.tuna.tsinghua.edu.cn/maven/repository/'
    }
    maven {
        url 'https://mirrors.huaweicloud.com/repository/maven/'
    }

核心库下载慢 react-android-0.76.1-debug.aar和hermes-android-0.76.1-debug.aar
手动下载地址 
    [https://repo.maven.apache.org/maven2/com/facebook/react/react-android/0.76.1/](https://repo.maven.apache.org/maven2/com/facebook/react/react-android/0.76.1/)
替换路径
    C:\Users\用户\.gradle\caches\modules-2\files-2.1\com.facebook.react\react-android
    根据已经生成的.module文件中的sha1值新建文件夹 并放置.aar文件
    debug 和 release 有不同配置


npm i jetifier
npx jetify


#### 签名
3f95ac28c6ade89874e3b7a2f512d2b5

#### 报错处理

* 加载老版本库文件报错
android.useAndroidX=true
android.enableJetifier=true
