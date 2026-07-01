package com.healthyuchallenge

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory
import com.zoontek.rnbootsplash.RNBootSplash
import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "HealthyUChallenge"

    override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme)

        supportFragmentManager.fragmentFactory =
            RNScreensFragmentFactory()

        super.onCreate(savedInstanceState)

        // Required by react-native-health-connect
        HealthConnectPermissionDelegate.setPermissionDelegate(this)
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(
            this,
            mainComponentName,
            fabricEnabled
        )
}