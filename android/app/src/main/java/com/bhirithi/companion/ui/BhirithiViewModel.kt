package com.bhirithi.companion.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bhirithi.companion.data.BhirithiRepository
import com.bhirithi.companion.data.NetworkBhirithiRepository
import com.bhirithi.companion.data.PandaMessage
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class BhirithiViewModel(
    private val repository: BhirithiRepository = NetworkBhirithiRepository()
) : ViewModel() {
    private val _selectedSection = kotlinx.coroutines.flow.MutableStateFlow("Panda")
    val selectedSection: StateFlow<String> = _selectedSection.asStateFlow()

    val messages: StateFlow<List<PandaMessage>> =
        repository.messages.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val isSending = kotlinx.coroutines.flow.MutableStateFlow(false)
    val errorMessage = kotlinx.coroutines.flow.MutableStateFlow<String?>(null)

    fun selectSection(section: String) {
        _selectedSection.value = section
        viewModelScope.launch { repository.selectSection(section) }
    }

    fun sendMessage(text: String) {
        val clean = text.trim()
        if (clean.isBlank() || isSending.value) return
        errorMessage.value = null
        val student = PandaMessage(
            id = "student-${System.currentTimeMillis()}",
            sender = com.bhirithi.companion.data.Sender.STUDENT,
            text = clean
        )
        val mutable = messages.value.toMutableList()
        mutable += student
        // The repository owns the authoritative history; this local append is handled by
        // the concrete repository through the next chat response. For the UI we expose
        // the pending message through a small overlay state.
        pendingMessages.value = mutable
        isSending.value = true
        viewModelScope.launch {
            val result = repository.sendPandaMessage(clean)
            result.onSuccess { reply ->
                val updated = pendingMessages.value.toMutableList()
                updated += PandaMessage(
                    id = "panda-${System.currentTimeMillis()}",
                    sender = com.bhirithi.companion.data.Sender.PANDA,
                    text = reply
                )
                pendingMessages.value = updated
            }.onFailure { error ->
                errorMessage.value = error.message ?: "Panda could not reply right now."
            }
            isSending.value = false
        }
    }

    private val pendingMessages = kotlinx.coroutines.flow.MutableStateFlow<List<PandaMessage>>(emptyList())

    val visibleMessages: StateFlow<List<PandaMessage>> =
        kotlinx.coroutines.flow.combine(messages, pendingMessages) { base, pending ->
            if (pending.isEmpty()) base else pending
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun clearError() { errorMessage.value = null }
}
