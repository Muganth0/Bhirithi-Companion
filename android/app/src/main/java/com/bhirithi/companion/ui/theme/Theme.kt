package com.bhirithi.companion.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val PandaLavender = Color(0xFF8878F6)
private val PandaMint = Color(0xFF71D4BE)
private val PandaPeach = Color(0xFFFFB77D)
private val PandaCream = Color(0xFFFFF9F2)
private val PandaInk = Color(0xFF282438)

private val LightColors = lightColorScheme(
    primary = PandaLavender,
    onPrimary = Color.White,
    secondary = PandaMint,
    onSecondary = PandaInk,
    tertiary = PandaPeach,
    onTertiary = PandaInk,
    background = PandaCream,
    onBackground = PandaInk,
    surface = Color.White,
    onSurface = PandaInk,
    surfaceVariant = Color(0xFFF0ECFF),
    onSurfaceVariant = Color(0xFF625D70),
    error = Color(0xFFBA1A1A)
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFFB9AEFF),
    onPrimary = Color(0xFF2D2468),
    secondary = Color(0xFF8FE7D1),
    onSecondary = Color(0xFF00382E),
    tertiary = Color(0xFFFFC59F),
    onTertiary = Color(0xFF4A270F),
    background = Color(0xFF171522),
    onBackground = Color(0xFFF5F0FF),
    surface = Color(0xFF211E2E),
    onSurface = Color(0xFFF5F0FF),
    surfaceVariant = Color(0xFF363142),
    onSurfaceVariant = Color(0xFFD0C8DC),
    error = Color(0xFFFFB4AB)
)

@Composable
fun BhirithiTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) DarkColors else LightColors,
        content = content
    )
}
