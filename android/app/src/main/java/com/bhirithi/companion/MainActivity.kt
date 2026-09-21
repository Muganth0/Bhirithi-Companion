package com.bhirithi.companion
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.bhirithi.companion.ui.BhirithiApp
import com.bhirithi.companion.ui.theme.BhirithiTheme
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { BhirithiTheme { BhirithiApp() } }
    }
}
