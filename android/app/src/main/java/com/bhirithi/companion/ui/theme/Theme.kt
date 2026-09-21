package com.bhirithi.companion.ui.theme
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
private val LightColors = lightColorScheme(
    primary = Color(0xFFE85D04), secondary = Color(0xFF52796F),
    background = Color(0xFFFFFBF7), surface = Color(0xFFFFFBF7),
    error = Color(0xFFBA1A1A), onPrimary = Color.White, onSecondary = Color.White,
    onBackground = Color(0xFF2D2926), onSurface = Color(0xFF2D2926)
)
private val DarkColors = darkColorScheme(
    primary = Color(0xFFFFB787), secondary = Color(0xFF9DD8C4),
    background = Color(0xFF201A17), surface = Color(0xFF201A17),
    error = Color(0xFFFFB4AB), onPrimary = Color(0xFF4D2100), onSecondary = Color(0xFF07372A),
    onBackground = Color(0xFFF1EAE5), onSurface = Color(0xFFF1EAE5)
)
@Composable
fun BhirithiTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = if (isSystemInDarkTheme()) DarkColors else LightColors, content = content)
}
