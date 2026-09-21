package com.bhirithi.companion.ui
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.material3.adaptive.currentWindowAdaptiveInfo
import androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteScaffold
import androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteType
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel

private data class Section(val title: String, val emoji: String)
private val sections = listOf(
    Section("Panda", "🐼"), Section("Study", "📚"), Section("Media", "📺"),
    Section("Yoga", "🧘"), Section("Routine", "📆"), Section("Parents", "🏡")
)
@Composable
fun BhirithiApp(vm: BhirithiViewModel = viewModel()) {
    val selected by vm.selectedSection.collectAsStateWithLifecycle()
    val section = sections.firstOrNull { it.title == selected } ?: sections.first()
    val window = currentWindowAdaptiveInfo()
    val navType = if (window.windowSizeClass.isExpanded) NavigationSuiteType.NavigationRail else NavigationSuiteType.NavigationBar
    NavigationSuiteScaffold(layoutType = navType, navigationSuiteItems = {
        sections.forEach { item ->
            item(
                selected = selected == item.title,
                onClick = { vm.selectSection(item.title) },
                icon = { Text(item.emoji) },
                label = { Text(item.title) }
            )
        }
    }) {
        Scaffold(topBar = { TopAppBar(title = { Text("Bhirithi Companion 🐼") }) }) { padding ->
            Column(
                Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(20.dp)) {
                        Text(section.emoji + " " + section.title, style = MaterialTheme.typography.headlineSmall)
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "Adaptive Android foundation. Feature code belongs behind the ViewModel → Repository boundary.",
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(sections) { navItem ->
                        Button(onClick = { vm.selectSection(navItem.title) }) {
                            Text(navItem.emoji + " " + navItem.title)
                        }
                    }
                }
            }
        }
    }
}
