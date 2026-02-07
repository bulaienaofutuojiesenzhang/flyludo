package com.jujin.tongchengyouyue

import com.facebook.react.ReactActivity
import org.devio.rn.splashscreen.SplashScreen // 引入 SplashScreen 包
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import android.os.Bundle

class MainActivity : ReactActivity() {

  /**
  * 在 Activity 启动时显示 SplashScreen
  */
  override fun onCreate(savedInstanceState: Bundle?) {
      SplashScreen.show(this, true) // 显示启动屏
      super.onCreate(savedInstanceState)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "yikaRn"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
