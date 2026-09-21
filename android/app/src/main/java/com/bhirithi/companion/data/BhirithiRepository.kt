package com.bhirithi.companion.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class PandaMessage(
    val id: String,
    val sender: Sender,
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
)

enum class Sender { PANDA, STUDENT }

interface BhirithiRepository {
    val selectedSection: Flow<String>
    val messages: Flow<List<PandaMessage>>
    suspend fun selectSection(section: String)
    suspend fun sendPandaMessage(message: String, role: String = "friend"): Result<String>
}

class NetworkBhirithiRepository(
    private val baseUrl: String = "https://bhirithi-companion.vercel.app"
) : BhirithiRepository {
    private val section = MutableStateFlow("Panda")
    private val chatMessages = MutableStateFlow(
        listOf(
            PandaMessage(
                id = "init-1",
                sender = Sender.PANDA,
                text = "Bamboo-hello, Bhirithi! 🐼 I am your cozy Panda companion! How are you feeling today?"
            )
        )
    )

    override val selectedSection: Flow<String> = section.asStateFlow()
    override val messages: Flow<List<PandaMessage>> = chatMessages.asStateFlow()

    override suspend fun selectSection(section: String) {
        this.section.value = section
    }

    override suspend fun sendPandaMessage(message: String, role: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val connection = (URL("${baseUrl.trimEnd('/')}/api/chat").openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 15_000
                readTimeout = 30_000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
            }

            val history = JSONArray()
            chatMessages.value.takeLast(10).forEach { item ->
                history.put(JSONObject().apply {
                    put("sender", if (item.sender == Sender.STUDENT) "student" else "panda")
                    put("text", item.text)
                })
            }

            val body = JSONObject().apply {
                put("message", message)
                put("history", history)
                put("role", role)
            }.toString()

            connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val responseText = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
            connection.disconnect()

            if (status !in 200..299) {
                return@withContext Result.failure(IllegalStateException(
                    JSONObject(responseText.ifBlank { "{}" }).optString("error", "Panda is temporarily unavailable.")
                ))
            }

            val reply = JSONObject(responseText).optString("text").trim()
            if (reply.isBlank()) return@withContext Result.failure(IllegalStateException("Panda returned an empty reply."))

            Result.success(reply)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
