package com.bhirithi.companion.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.material3.adaptive.currentWindowAdaptiveInfo
import androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteScaffold
import androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteType
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bhirithi.companion.data.Sender
import java.util.Locale

private data class Section(val title: String, val emoji: String)
private val sections = listOf(
    Section("Panda", "🐼"),
    Section("Study", "📚"),
    Section("Yoga", "🧘"),
    Section("Routine", "📆"),
    Section("Parents", "🏡"),
    Section("Rescue", "🛟")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BhirithiApp(vm: BhirithiViewModel = viewModel()) {
    val selected by vm.selectedSection.collectAsStateWithLifecycle()
    val window = currentWindowAdaptiveInfo()
    val navType = NavigationSuiteScaffoldDefaults.navigationSuiteType(window)

    NavigationSuiteScaffold(
        layoutType = navType,
        navigationSuiteItems = {
            sections.forEach { navItem ->
                item(
                    selected = selected == navItem.title,
                    onClick = { vm.selectSection(navItem.title) },
                    icon = { Text(navItem.emoji) },
                    label = { Text(navItem.title) }
                )
            }
        }
    ) {
        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            topBar = {
                TopAppBar(
                    title = {
                        Column {
                            Text("Hi, Bhirithi! 👋", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            Text("Let’s learn with Panda", style = MaterialTheme.typography.labelMedium)
                        }
                    },
                    actions = {
                        Surface(shape = CircleShape, color = MaterialTheme.colorScheme.secondaryContainer) {
                            Text("🐼", modifier = Modifier.padding(10.dp), style = MaterialTheme.typography.titleMedium)
                        }
                        Spacer(Modifier.width(12.dp))
                    }
                )
            }
        ) { padding ->
            Box(Modifier.fillMaxSize().padding(padding)) {
                when (selected) {
                    "Panda" -> PandaChatScreen(vm)
                    "Study" -> StudyScreen()
                    "Yoga" -> YogaScreen()
                    "Routine" -> RoutineScreen()
                    "Parents" -> ParentScreen()
                    "Rescue" -> RescueScreen()
                    else -> PandaChatScreen(vm)
                }
            }
        }
    }
}

@Composable
private fun PandaChatScreen(vm: BhirithiViewModel) {
    val context = LocalContext.current
    val messages by vm.visibleMessages.collectAsStateWithLifecycle()
    val isSending by vm.isSending.collectAsStateWithLifecycle()
    val error by vm.errorMessage.collectAsStateWithLifecycle()
    var input by rememberSaveable { mutableStateOf("") }
    var isListening by rememberSaveable { mutableStateOf(false) }
    val listState = rememberLazyListState()

    val tts = remember {
        TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                // Prefer Indian English; the exact installed voice depends on the device.
            }
        }
    }

    fun speakPanda(text: String) {
        val clean = text.replace(Regex("https?://\\S+"), "").trim()
        if (clean.isBlank()) return
        tts.language = Locale("en", "IN")
        tts.setSpeechRate(0.98f)
        tts.setPitch(1.18f)
        val voice = tts.voices?.firstOrNull {
            it.locale.language == "en" &&
                (it.locale.country.equals("IN", true) || it.name.contains("en-in", true))
        } ?: tts.voices?.firstOrNull { it.locale.language == "en" }
        if (voice != null) tts.voice = voice
        tts.speak(clean, TextToSpeech.QUEUE_FLUSH, null, "panda-${System.currentTimeMillis()}")
    }

    DisposableEffect(Unit) {
        onDispose {
            tts.stop()
            tts.shutdown()
        }
    }

    val recognizer = remember {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            SpeechRecognizer.createSpeechRecognizer(context)
        } else null
    }

    DisposableEffect(recognizer) {
        if (recognizer != null) {
            recognizer.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: android.os.Bundle?) { isListening = true }
                override fun onBeginningOfSpeech() { isListening = true }
                override fun onRmsChanged(rmsdB: Float) = Unit
                override fun onBufferReceived(buffer: ByteArray?) = Unit
                override fun onEndOfSpeech() { isListening = false }
                override fun onError(error: Int) { isListening = false }
                override fun onResults(results: android.os.Bundle?) {
                    isListening = false
                    val spoken = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        ?.firstOrNull().orEmpty()
                    if (spoken.isNotBlank()) input = spoken
                }
                override fun onPartialResults(partialResults: android.os.Bundle?) {
                    val spoken = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        ?.firstOrNull().orEmpty()
                    if (spoken.isNotBlank()) input = spoken
                }
                override fun onEvent(eventType: Int, params: android.os.Bundle?) = Unit
            })
        }
        onDispose {
            recognizer?.cancel()
            recognizer?.destroy()
        }
    }

    fun startListening() {
        if (recognizer == null) return
        recognizer.startListening(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-IN")
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        })
    }

    val micLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) startListening()
    }

    LaunchedEffect(messages.size, isSending) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.lastIndex)
    }

    LaunchedEffect(messages.lastOrNull()?.id) {
        val last = messages.lastOrNull()
        if (last?.sender == Sender.PANDA) speakPanda(last.text)
    }

    Column(
        Modifier.fillMaxSize().padding(horizontal = 12.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(28.dp))
                .background(
                    Brush.linearGradient(
                        listOf(
                            MaterialTheme.colorScheme.primaryContainer,
                            MaterialTheme.colorScheme.secondaryContainer,
                            MaterialTheme.colorScheme.tertiaryContainer
                        )
                    )
                )
                .padding(18.dp)
        ) {
            Row(
                Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    modifier = Modifier.size(68.dp),
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.85f)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("🐼", style = MaterialTheme.typography.headlineMedium)
                    }
                }
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text("Panda Chat", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Text("Ask, talk, learn and explore together.", style = MaterialTheme.typography.bodyMedium)
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        AssistChip(onClick = { input = "Give me a fun quiz!" }, label = { Text("🎯 Quiz") })
                        AssistChip(onClick = { input = "Teach me something fun!" }, label = { Text("✨ Learn") })
                    }
                }
            }
        }

        LazyColumn(
            modifier = Modifier.weight(1f).fillMaxWidth(),
            state = listState,
            contentPadding = PaddingValues(vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(messages, key = { it.id }) { message ->
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = if (message.sender == Sender.STUDENT) Arrangement.End else Arrangement.Start
                ) {
                    Surface(
                        tonalElevation = 2.dp,
                        shape = RoundedCornerShape(18.dp),
                        modifier = Modifier.widthIn(max = 720.dp)
                    ) {
                        Column(Modifier.padding(14.dp)) {
                            Text(
                                if (message.sender == Sender.PANDA) "🐼 Panda" else "You",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(Modifier.height(4.dp))
                            Text(message.text, style = MaterialTheme.typography.bodyLarge)
                            if (message.sender == Sender.PANDA) {
                                TextButton(onClick = { speakPanda(message.text) }) {
                                    Text("🔊 Hear Panda")
                                }
                            }
                        }
                    }
                }
            }
            if (isSending) {
                item {
                    Text("🐼 Panda is thinking…", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }

        if (error != null) {
            AssistChip(
                onClick = { vm.clearError() },
                label = { Text(error ?: "Panda is unavailable") },
                leadingIcon = { Text("⚠️") }
            )
        }

        Row(
            Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.Bottom,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = input,
                onValueChange = { input = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Ask Panda anything…") },
                minLines = 1,
                maxLines = 4,
                enabled = !isSending
            )

            IconButton(
                onClick = {
                    if (isListening) {
                        recognizer?.stopListening()
                        isListening = false
                    } else if (context.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                        startListening()
                    } else {
                        micLauncher.launch(Manifest.permission.RECORD_AUDIO)
                    }
                },
                enabled = !isSending && recognizer != null,
                modifier = Modifier.semantics {
                    contentDescription = if (isListening) "Stop Panda voice input" else "Start Panda voice input"
                }
            ) {
                Icon(
                    if (isListening) Icons.Default.Stop else Icons.Default.Mic,
                    contentDescription = null
                )
            }

            IconButton(
                onClick = {
                    val text = input.trim()
                    if (text.isNotBlank()) {
                        input = ""
                        vm.sendMessage(text)
                    }
                },
                enabled = input.isNotBlank() && !isSending,
                modifier = Modifier.semantics { contentDescription = "Send message to Panda" }
            ) {
                Icon(Icons.Default.Send, contentDescription = null)
            }
        }
    }
}

@Composable
private fun StudyScreen() {
    SimpleFeatureScreen(
        emoji = "📚",
        title = "Study",
        subtitle = "CBSE / NCERT Class 6 study companion",
        cards = listOf(
            "Ask Panda a chapter doubt" to "Use Panda Chat for explanations, examples and practice questions.",
            "Math practice" to "Practice numbers, algebra, geometry and word problems in short sessions.",
            "Science practice" to "Revise concepts with simple explanations and quick self-check questions."
        )
    )
}

@Composable
private fun YogaScreen() {
    SimpleFeatureScreen(
        emoji = "🧘",
        title = "Yoga",
        subtitle = "Safe practice reminders and training support",
        cards = listOf(
            "Breathing warm-up" to "Begin with calm breathing and a gentle warm-up.",
            "Practice log" to "Record today's practice duration and what you worked on.",
            "Yoga Radar" to "The web app can surface live competition/news information; native live API integration is next."
        )
    )
}

@Composable
private fun RoutineScreen() {
    SimpleFeatureScreen(
        emoji = "📆",
        title = "Routine",
        subtitle = "Simple daily structure",
        cards = listOf(
            "Morning" to "Wake up • hydrate • prepare for school • short breathing check-in.",
            "Study" to "Use focused study blocks with short movement/eye-rest breaks.",
            "Evening" to "Yoga/practice • homework review • prepare for tomorrow • sleep routine."
        )
    )
}

@Composable
private fun ParentScreen() {
    SimpleFeatureScreen(
        emoji = "🏡",
        title = "Parents",
        subtitle = "Supportive school-home connection",
        cards = listOf(
            "Daily observation" to "Review study, routine and practice notes.",
            "Panda report" to "The existing web backend can generate an observational parent bulletin; native report API integration is next.",
            "Privacy" to "Keep this app private and avoid exposing API keys or sensitive identifiers."
        )
    )
}

@Composable
private fun RescueScreen() {
    SimpleFeatureScreen(
        emoji = "🛟",
        title = "Rescue",
        subtitle = "Quick-access safety guidance",
        cards = listOf(
            "Immediate danger" to "Use the phone's normal emergency calling features and contact a trusted adult.",
            "Location privacy" to "The native app does not request location automatically.",
            "Emergency data" to "A full RescueBeacon workflow can be ported next with explicit permissions and clear user controls."
        )
    )
}

@Composable
private fun SimpleFeatureScreen(
    emoji: String,
    title: String,
    subtitle: String,
    cards: List<Pair<String, String>>
) {
    Column(
        Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Card(Modifier.fillMaxWidth(), shape = RoundedCornerShape(20.dp)) {
            Column(Modifier.padding(20.dp)) {
                Text("$emoji $title", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(6.dp))
                Text(subtitle, style = MaterialTheme.typography.bodyLarge)
            }
        }
        cards.forEach { (heading, body) ->
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(heading, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text(body, style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
    }
}
